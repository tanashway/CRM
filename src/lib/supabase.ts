import { createClient as createServerClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Initialize the Supabase admin client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if environment variables are set
if (!supabaseUrl) {
  console.error('NEXT_PUBLIC_SUPABASE_URL is not set');
}

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is not set');
}

// Admin client for server usage (with service role key)
export const supabaseAdmin = createServerClient(
  supabaseUrl || '',
  supabaseServiceKey || ''
);

// Helper function to get the Supabase client for API routes
export async function getSupabaseClient() {
  try {
    const { createClient } = await import('@/utils/supabase/server');
    const cookieStore = cookies();
    return createClient(cookieStore);
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    return supabaseAdmin; // Fallback to admin client
  }
} 