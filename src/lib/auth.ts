import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// Get the current user from Clerk
export async function getCurrentUser() {
  try {
    const session = await auth();
    return session.userId;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Get the current user's data from Supabase
export async function getCurrentUserData() {
  try {
    const clerkId = await getCurrentUser();
    
    if (!clerkId) {
      return null;
    }
    
    // Try to get user data from Supabase
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('clerk_id', clerkId)
      .single();
    
    if (error) {
      console.error('Error fetching user data:', error);
      
      // If user doesn't exist, create a new user
      if (error.code === 'PGRST116') {
        const { data: newUser, error: insertError } = await supabaseAdmin
          .from('users')
          .insert({
            clerk_id: clerkId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();
        
        if (insertError) {
          console.error('Error creating user:', insertError);
          return null;
        }
        
        return newUser;
      }
      
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getCurrentUserData:', error);
    return null;
  }
}

// Check if the current user has access to a resource
export async function checkUserAccess(resourceTable: string, resourceId: string) {
  try {
    const clerkId = await getCurrentUser();
    
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
  } catch (error) {
    console.error('Error in checkUserAccess:', error);
    return false;
  }
} 