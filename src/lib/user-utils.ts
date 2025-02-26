import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from './supabase';

// Ensure a user exists in Supabase
export async function ensureUserExists() {
  try {
    const session = await auth();
    const clerkId = session?.userId;
    
    if (!clerkId) {
      console.error('No user ID found in session');
      return null;
    }
    
    // Check if user exists in Supabase
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('clerk_id', clerkId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking user:', checkError);
      return null;
    }
    
    // If user exists, return it
    if (existingUser) {
      return existingUser;
    }
    
    // Get user data from Clerk
    const { data: userData } = await supabaseAdmin.auth.getUser(clerkId);
    const user = userData?.user;
    
    if (!user) {
      console.error('User not found in Clerk');
      
      // Create a minimal user record
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
    
    // Create user in Supabase
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        clerk_id: clerkId,
        email: user.email,
        first_name: '',
        last_name: '',
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
  } catch (error) {
    console.error('Error ensuring user exists:', error);
    return null;
  }
} 