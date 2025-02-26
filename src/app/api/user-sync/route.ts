import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';

// Define email address type
interface EmailAddress {
  id: string;
  emailAddress: string;
}

// This endpoint handles Clerk webhooks to sync user data to Supabase
export async function POST(req: NextRequest) {
  // Verify the webhook signature
  const headersList = headers();
  const svixId = headersList.get('svix-id');
  const svixTimestamp = headersList.get('svix-timestamp');
  const svixSignature = headersList.get('svix-signature');
  
  // If there's no signature, this might be a manual sync request
  const isManualSync = !svixId && !svixTimestamp && !svixSignature;
  
  if (!isManualSync) {
    // Verify the webhook signature for automated requests
    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error('Missing Svix headers');
      return NextResponse.json({ error: 'Missing Svix headers' }, { status: 400 });
    }
    
    // Get the Clerk webhook secret from environment variables
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    
    if (!WEBHOOK_SECRET) {
      console.error('Missing CLERK_WEBHOOK_SECRET');
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }
    
    // Create a new Svix instance with the webhook secret
    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: WebhookEvent;
    
    try {
      // Verify the webhook payload
      const payload = await req.text();
      evt = wh.verify(payload, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as WebhookEvent;
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
    
    // Handle different webhook events
    const eventType = evt.type;
    
    if (eventType === 'user.created' || eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name } = evt.data;
      
      // Get the primary email
      const primaryEmail = email_addresses?.find(email => email.id === evt.data.primary_email_address_id)?.email_address;
      
      // Sync user to Supabase
      return await syncUserToSupabase(id, primaryEmail, first_name, last_name);
    } else if (eventType === 'user.deleted') {
      // Handle user deletion if needed
      const { id } = evt.data;
      
      // Delete user from Supabase
      const { error } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('clerk_id', id);
      
      if (error) {
        console.error('Error deleting user from Supabase:', error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
      }
      
      return NextResponse.json({ message: 'User deleted successfully' });
    }
    
    // Return a 200 response for other event types
    return NextResponse.json({ message: 'Webhook received' });
  } else {
    // Handle manual sync request
    try {
      const body = await req.json();
      const { userId } = body;
      
      if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
      }
      
      // Get user data from Clerk
      const user = await clerkClient.users.getUser(userId);
      
      if (!user) {
        return NextResponse.json({ error: 'User not found in Clerk' }, { status: 404 });
      }
      
      // Get the primary email
      const primaryEmail = user.emailAddresses.find((email: EmailAddress) => email.id === user.primaryEmailAddressId)?.emailAddress;
      
      // Sync user to Supabase
      return await syncUserToSupabase(user.id, primaryEmail, user.firstName, user.lastName);
    } catch (error) {
      console.error('Error in manual sync:', error);
      return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 });
    }
  }
}

// Helper function to sync user data to Supabase
async function syncUserToSupabase(
  clerkId: string,
  email?: string | null,
  firstName?: string | null,
  lastName?: string | null
) {
  try {
    // Check if user already exists in Supabase
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('clerk_id', clerkId)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is the error code for "no rows returned"
      console.error('Error fetching user from Supabase:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
    
    const userData = {
      clerk_id: clerkId,
      email: email || null,
      first_name: firstName || null,
      last_name: lastName || null,
      updated_at: new Date().toISOString(),
    };
    
    let result;
    
    if (existingUser) {
      // Update existing user
      result = await supabaseAdmin
        .from('users')
        .update(userData)
        .eq('clerk_id', clerkId)
        .select()
        .single();
    } else {
      // Create new user
      result = await supabaseAdmin
        .from('users')
        .insert({
          ...userData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
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
    console.error('Error in syncUserToSupabase:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 