import { auth } from '@clerk/nextjs';
import { supabaseAdmin } from './supabase';

// Get the current user from Clerk
export function getCurrentUser() {
  const { userId } = auth();
  return userId;
}

// Get the current user's data from Supabase
export async function getCurrentUserData() {
  const clerkId = getCurrentUser();
  
  if (!clerkId) {
    return null;
  }
  
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('clerk_id', clerkId)
    .single();
  
  if (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
  
  return data;
}

// Check if the current user has access to a resource
export async function checkUserAccess(resourceTable: string, resourceId: string) {
  const clerkId = getCurrentUser();
  
  if (!clerkId) {
    return false;
  }
  
  const { data: userData, error: userError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('clerk_id', clerkId)
    .single();
  
  if (userError || !userData) {
    return false;
  }
  
  const { count, error } = await supabaseAdmin
    .from(resourceTable)
    .select('*', { count: 'exact', head: true })
    .eq('id', resourceId)
    .eq('user_id', userData.id);
  
  if (error || count === 0) {
    return false;
  }
  
  return true;
} 