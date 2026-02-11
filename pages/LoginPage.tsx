
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export const LoginPage: React.FC = () => {
  const { signInWithGoogle, user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#ccff00] rounded-full blur-3xl animate-pulse" style={{animationDuration: '4s'}}></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-[#ccff00] rounded-full blur-3xl animate-pulse" style={{animationDuration: '5s', animationDelay: '1s'}}></div>
      </div>

      <div className="w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-2xl p-8 shadow-2xl text-center relative z-10">
        {/* Logo section */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <svg width="48" height="48" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="64" cy="64" r="52" fill="none" stroke="#ccff00" strokeWidth="3" opacity="0.8"/>
              <path d="M 64 32 L 70 50 L 58 50 L 72 80 L 60 80 L 74 110 L 50 70 L 62 70 L 48 32 Z" fill="#ccff00" opacity="0.95"/>
              <circle cx="85" cy="50" r="3" fill="#ccff00" opacity="0.7"/>
              <circle cx="43" cy="78" r="3" fill="#ccff00" opacity="0.7"/>
            </svg>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#ccff00] to-[#99cc00] bg-clip-text text-transparent">StokeMeet</h1>
          </div>
          <p className="text-[#8b949e] text-sm font-medium tracking-widest uppercase">Intelligence in Every Meeting</p>
        </div>

        <div className="border-t border-[#30363d] my-6"></div>

        <h2 className="text-2xl font-bold text-[#e6edf3] mb-2">Welcome Back</h2>
        <p className="text-[#8b949e] mb-8">Sign in to access your intelligent meeting insights and analytics.</p>

        <button
          onClick={signInWithGoogle}
          className="w-full bg-[#e6edf3] hover:bg-white text-[#0d1117] font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 hover:scale-[1.02]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign in with Google
        </button>

        <p className="mt-6 text-xs text-[#8b949e]">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};
