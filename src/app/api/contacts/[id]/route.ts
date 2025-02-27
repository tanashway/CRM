import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getCurrentUserData } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';

// GET /api/contacts/[id] - Get a specific contact
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const clerkId = await getCurrentUser();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userData = await getCurrentUserData();
    
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const { data, error } = await supabaseAdmin
      .from('contacts')
      .select('*')
      .eq('id', context.params.id)
      .eq('user_id', userData.id)
      .single();
    
    if (error) {
      console.error('Error fetching contact:', error);
      return NextResponse.json({ error: 'Failed to fetch contact' }, { status: 500 });
    }
    
    if (!data) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in contact GET route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/contacts/[id] - Update a specific contact
export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const clerkId = await getCurrentUser();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userData = await getCurrentUserData();
    
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const body = await req.json();
    
    // Validate required fields
    if (!body.first_name) {
      return NextResponse.json({ error: 'First name is required' }, { status: 400 });
    }
    
    // Check if contact exists and belongs to user
    const { data: existingContact, error: fetchError } = await supabaseAdmin
      .from('contacts')
      .select('id')
      .eq('id', context.params.id)
      .eq('user_id', userData.id)
      .single();
    
    if (fetchError || !existingContact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }
    
    // Update contact
    const { data, error } = await supabaseAdmin
      .from('contacts')
      .update({
        first_name: body.first_name,
        last_name: body.last_name || '',
        email: body.email || '',
        phone: body.phone || '',
        company: body.company || '',
        position: body.position || '',
        notes: body.notes || '',
        status: body.status || 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', context.params.id)
      .eq('user_id', userData.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating contact:', error);
      return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in contact PATCH route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/contacts/[id] - Update a specific contact (alias for PATCH)
export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const clerkId = await getCurrentUser();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userData = await getCurrentUserData();
    
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const body = await req.json();
    
    // Validate required fields
    if (!body.first_name) {
      return NextResponse.json({ error: 'First name is required' }, { status: 400 });
    }
    
    // Check if contact exists and belongs to user
    const { data: existingContact, error: fetchError } = await supabaseAdmin
      .from('contacts')
      .select('id')
      .eq('id', context.params.id)
      .eq('user_id', userData.id)
      .single();
    
    if (fetchError || !existingContact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }
    
    // Update contact
    const { data, error } = await supabaseAdmin
      .from('contacts')
      .update({
        first_name: body.first_name,
        last_name: body.last_name || '',
        email: body.email || '',
        phone: body.phone || '',
        company: body.company || '',
        position: body.position || '',
        notes: body.notes || '',
        status: body.status || 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', context.params.id)
      .eq('user_id', userData.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating contact:', error);
      return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in contact PUT route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/contacts/[id] - Delete a specific contact
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const clerkId = await getCurrentUser();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userData = await getCurrentUserData();
    
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check if contact exists and belongs to user
    const { data: existingContact, error: fetchError } = await supabaseAdmin
      .from('contacts')
      .select('id')
      .eq('id', context.params.id)
      .eq('user_id', userData.id)
      .single();
    
    if (fetchError || !existingContact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }
    
    // Delete contact
    const { error } = await supabaseAdmin
      .from('contacts')
      .delete()
      .eq('id', context.params.id)
      .eq('user_id', userData.id);
    
    if (error) {
      console.error('Error deleting contact:', error);
      return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error in contact DELETE route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 