import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// Webhook handler for Clerk events
export async function POST(req: NextRequest) {
  // Get the headers
  const svixId = req.headers.get('svix-id') || '';
  const svixTimestamp = req.headers.get('svix-timestamp') || '';
  const svixSignature = req.headers.get('svix-signature') || '';

  const headerPayload = {
    'svix-id': svixId,
    'svix-timestamp': svixTimestamp,
    'svix-signature': svixSignature,
  };

  // Validate the webhook
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  // If the webhook secret is not set, return an error
  if (!webhookSecret) {
    console.error('CLERK_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not set' },
      { status: 500 }
    );
  }

  // Validate the webhook
  const payload = await req.text();
  const svix = new Webhook(webhookSecret);

  let event: WebhookEvent;

  try {
    event = svix.verify(payload, headerPayload) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 400 }
    );
  }

  // Handle the event
  const eventType = event.type;

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = event.data;

    // Get the primary email
    const primaryEmail = email_addresses && email_addresses[0]?.email_address;

    // Check if user exists
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking user:', checkError);
      return NextResponse.json(
        { error: 'Error checking user' },
        { status: 500 }
      );
    }

    if (existingUser) {
      // Update user
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          email: primaryEmail,
          first_name: first_name || '',
          last_name: last_name || '',
          updated_at: new Date().toISOString(),
        })
        .eq('clerk_id', id);

      if (updateError) {
        console.error('Error updating user:', updateError);
        return NextResponse.json(
          { error: 'Error updating user' },
          { status: 500 }
        );
      }
    } else {
      // Create user
      const { error: insertError } = await supabaseAdmin
        .from('users')
        .insert({
          clerk_id: id,
          email: primaryEmail,
          first_name: first_name || '',
          last_name: last_name || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error('Error creating user:', insertError);
        return NextResponse.json(
          { error: 'Error creating user' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  }

  if (eventType === 'user.deleted') {
    const { id } = event.data;

    // Delete user
    const { error: deleteError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('clerk_id', id);

    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      return NextResponse.json(
        { error: 'Error deleting user' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  }

  // Return a 200 response for other events
  return NextResponse.json({ success: true });
} 