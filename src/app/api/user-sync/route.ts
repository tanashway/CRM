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
  try {
    // Verify the webhook signature
    const headersList = await headers();
    const svixId = headersList.get('svix-id') || null;
    const svixTimestamp = headersList.get('svix-timestamp') || null;
    const svixSignature = headersList.get('svix-signature') || null;
    
    // If there's no signature, this might be a manual sync request
    const isManualSync = !svixId && !svixTimestamp && !svixSignature;
    
    let userId: string | null | undefined = null;
    let eventType: string | null = null;
    let userData: {
      id?: string;
      emailAddresses?: Array<{ id: string; emailAddress: string }>;
      primaryEmailAddressId?: string;
      firstName?: string | null;
      lastName?: string | null;
      [key: string]: unknown;
    } | null = null;
    
    if (!isManualSync) {
      // Verify the webhook signature for automated requests
      if (!svixId || !svixTimestamp || !svixSignature) {
        console.error('Missing Svix headers');
        return NextResponse.json({ error: 'Missing Svix headers' }, { status: 400 });
      }
      
      // Get the webhook secret from environment variables
      const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
      
      if (!webhookSecret) {
        console.error('Missing Clerk webhook secret');
        return NextResponse.json({ error: 'Missing webhook secret' }, { status: 500 });
      }
      
      // Create a new Svix webhook instance with the secret
      const wh = new Webhook(webhookSecret);
      
      // Get the raw body from the request
      const body = await req.text();
      
      // Verify the webhook payload
      let evt: WebhookEvent;
      
      try {
        evt = wh.verify(body, {
          'svix-id': svixId,
          'svix-timestamp': svixTimestamp,
          'svix-signature': svixSignature,
        }) as WebhookEvent;
      } catch (err) {
        console.error('Error verifying webhook:', err);
        return NextResponse.json({ error: 'Error verifying webhook' }, { status: 400 });
      }
      
      // Extract the event type and data
      eventType = evt.type;
      
      // Process based on event type
      if (eventType === 'user.created' || eventType === 'user.updated') {
        userId = evt.data.id;
        // @ts-expect-error - Clerk webhook data structure
        userData = evt.data;
      } else {
        // We only care about user events for syncing
        return NextResponse.json({ message: 'Ignored event type' }, { status: 200 });
      }
    } else {
      // This is a manual sync request, get the user ID from the request body
      const body = await req.json();
      userId = body.userId;
      
      if (!userId) {
        return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
      }
    }
    
    // Get user data from Clerk if not already provided by webhook
    if (!userData) {
      const clerk = await clerkClient();
      // Ensure userId is not null before passing to getUser
      if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
      }
      // @ts-expect-error - Clerk API response structure
      userData = await clerk.users.getUser(userId);
      
      if (!userData) {
        return NextResponse.json({ error: 'User not found in Clerk' }, { status: 404 });
      }
    }
    
    // Get the primary email
    const primaryEmail = userData.emailAddresses?.find(
      (email: EmailAddress) => email.id === userData.primaryEmailAddressId
    )?.emailAddress || null; // Ensure null instead of undefined
    
    // Check if user already exists in Supabase
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('clerk_id', userId as string) // Cast to string since we've verified it's not null
      .single();
    
    const userDataToSync = {
      clerk_id: userId as string, // Cast to string since we've verified it's not null
      email: primaryEmail,
      first_name: userData.firstName || null,
      last_name: userData.lastName || null,
      updated_at: new Date().toISOString(),
    };
    
    let result;
    
    if (fetchError && fetchError.code === 'PGRST116') {
      // User doesn't exist, create new user
      console.log('Creating new user in Supabase:', userId);
      result = await supabaseAdmin
        .from('users')
        .insert({
          ...userDataToSync,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
    } else if (!fetchError) {
      // User exists, update user
      console.log('Updating existing user in Supabase:', userId);
      result = await supabaseAdmin
        .from('users')
        .update(userDataToSync)
        .eq('clerk_id', userId)
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
      event: eventType,
    });
  } catch (error) {
    console.error('Error in user-sync webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 