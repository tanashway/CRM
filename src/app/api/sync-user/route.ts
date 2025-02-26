import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';
import { clerkClient } from '@clerk/nextjs/server';

// Define email address type
interface EmailAddress {
  id: string;
  emailAddress: string;
}

// POST /api/sync-user - Manually sync the current user to Supabase
export async function POST() {
  try {
    const clerkId = await getCurrentUser();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user data from Clerk
    const user = await clerkClient.users.getUser(clerkId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found in Clerk' }, { status: 404 });
    }
    
    // Get the primary email
    const primaryEmail = user.emailAddresses.find(
      (email: EmailAddress) => email.id === user.primaryEmailAddressId
    )?.emailAddress;
    
    // Check if user already exists in Supabase
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('clerk_id', clerkId)
      .single();
    
    const userData = {
      clerk_id: clerkId,
      email: primaryEmail || null,
      first_name: user.firstName || null,
      last_name: user.lastName || null,
      updated_at: new Date().toISOString(),
    };
    
    let result;
    
    if (fetchError && fetchError.code === 'PGRST116') {
      // User doesn't exist, create new user
      console.log('Creating new user in Supabase:', clerkId);
      result = await supabaseAdmin
        .from('users')
        .insert({
          ...userData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
    } else if (!fetchError) {
      // User exists, update user
      console.log('Updating existing user in Supabase:', clerkId);
      result = await supabaseAdmin
        .from('users')
        .update(userData)
        .eq('clerk_id', clerkId)
        .select()
        .single();
    } else {
      // Other error occurred
      console.error('Error fetching user from Supabase:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
    
    if (result.error) {
      console.error('Error syncing user to Supabase:', result.error);
      return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 });
    }
    
    return NextResponse.json({
      message: existingUser ? 'User updated successfully' : 'User created successfully',
      user: result.data,
    });
  } catch (error) {
    console.error('Error in sync-user route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 