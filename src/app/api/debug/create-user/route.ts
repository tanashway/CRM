import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// Debug endpoint to manually create a user in Supabase
// Only use this in development
export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
  }

  try {
    const session = await auth();
    const clerkId = session?.userId;
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('clerk_id', clerkId)
      .single();
    
    if (!checkError && existingUser) {
      return NextResponse.json({ 
        message: 'User already exists', 
        user: existingUser 
      });
    }
    
    // Create user in Supabase
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        clerk_id: clerkId,
        email: 'test@example.com', // You can get this from Clerk if needed
        first_name: 'Test',
        last_name: 'User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating user:', insertError);
      return NextResponse.json({ error: 'Failed to create user', details: insertError }, { status: 500 });
    }
    
    return NextResponse.json({ 
      message: 'User created successfully', 
      user: newUser 
    });
  } catch (error) {
    console.error('Error in debug create-user route:', error);
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 });
  }
} 