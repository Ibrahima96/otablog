import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if we have valid credentials (not empty and not placeholders)
const isUrlValid = supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co';
const isKeyValid = supabaseAnonKey && supabaseAnonKey !== 'placeholder-key';

export const isSupabaseConfigured = isUrlValid && isKeyValid;

if (!isSupabaseConfigured) {
  console.warn("Supabase credentials missing or invalid. Auth features will be disabled.");
}

// Initialize Supabase client
// We use fallback strings only to prevent the application from crashing synchronously 
// if environment variables are missing (e.g. during CI/CD or initial setup).
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);