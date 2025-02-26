import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Client for browser usage (with anonymous key)
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Client for server usage (with service role key)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to get the appropriate client based on context
export function getSupabase(admin = false) {
  return admin ? supabaseAdmin : supabaseClient;
} 