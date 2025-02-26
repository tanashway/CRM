import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Verify the webhook signature
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');
  
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse('Missing svix headers', { status: 400 });
  }
  
  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);
  
  // Create a new Svix instance with your webhook secret
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || '';
  const wh = new Webhook(webhookSecret);
  
  let evt: WebhookEvent;
  
  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new NextResponse('Error verifying webhook', { status: 400 });
  }
  
  // Handle the webhook event
  const eventType = evt.type;
  
  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses[0]?.email_address;
    
    if (!email) {
      return new NextResponse('No email found for user', { status: 400 });
    }
    
    // Upsert user in Supabase
    const { error } = await supabaseAdmin
      .from('users')
      .upsert({
        clerk_id: id,
        email: email,
        first_name: first_name || '',
        last_name: last_name || '',
        updated_at: new Date().toISOString(),
      })
      .match({ clerk_id: id });
    
    if (error) {
      console.error('Error upserting user:', error);
      return new NextResponse('Error upserting user', { status: 500 });
    }
    
    return new NextResponse('User synchronized successfully', { status: 200 });
  }
  
  return new NextResponse('Webhook received', { status: 200 });
} 