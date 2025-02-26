import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

// This route syncs the current user to Supabase without requiring Clerk API access
export async function GET(req: NextRequest) {
  try {
    // Get the current user from Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Create a Supabase client with the service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    
    // Check if user exists in Supabase
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single();
    
    let result;
    
    if (fetchError && fetchError.code === 'PGRST116') {
      // User doesn't exist, create new user
      console.log('Creating new user in Supabase:', userId);
      result = await supabase
        .from('users')
        .insert({
          clerk_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
        
      if (result.error) {
        console.error('Error creating user:', result.error);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }
      
      return NextResponse.json({
        message: 'User created successfully',
        user: result.data,
      });
    } else if (!fetchError) {
      // User exists, return success
      return NextResponse.json({
        message: 'User already exists',
        user: existingUser,
      });
    } else {
      // Other error occurred
      console.error('Error fetching user from Supabase:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in sync-current-user route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 