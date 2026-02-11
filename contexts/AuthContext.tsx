
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authCallbackProcessed, setAuthCallbackProcessed] = useState(false);

  useEffect(() => {
    let mounted = true;
    let authCheckTimeout: NodeJS.Timeout;

    // Check if we are handling an OAuth callback
    const hasAuthParams = window.location.hash.includes('access_token') || 
                          window.location.search.includes('code');

    // Set up auth state change listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      setAuthCallbackProcessed(true);
      
      // Clear the auth params from URL after successful auth
      if (session && (window.location.hash.includes('access_token') || window.location.search.includes('code'))) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    });

    // Then get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;

      if (session) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        setAuthCallbackProcessed(true);
      } else if (!hasAuthParams) {
        // No session and no auth params - we're not logging in
        setSession(null);
        setUser(null);
        setLoading(false);
        setAuthCallbackProcessed(true);
      } else {
        // Has auth params but no session yet - wait longer for Supabase to process
        authCheckTimeout = setTimeout(() => {
          if (!mounted) return;
          
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (!mounted) return;
            
            if (session) {
              setSession(session);
              setUser(session?.user ?? null);
            } else {
              // Still no session after wait - something went wrong
              setSession(null);
              setUser(null);
            }
            setLoading(false);
            setAuthCallbackProcessed(true);
          });
        }, 2000); // Wait 2 seconds for Supabase to process the token
      }
    });

    return () => {
      mounted = false;
      clearTimeout(authCheckTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/login`
      }
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
