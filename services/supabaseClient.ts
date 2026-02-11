
import { createClient } from '@supabase/supabase-js';

// These will need to be set in your .env file
// VITE_SUPABASE_URL=https://zlcbyqnhmtoymrzlpmjc.supabase.co
// VITE_SUPABASE_ANON_KEY=your-anon-key

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zlcbyqnhmtoymrzlpmjc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
