import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getCurrentUserData, checkUserAccess } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/contacts/[id] - Get a specific contact
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clerkId = getCurrentUser();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const hasAccess = await checkUserAccess('contacts', params.id);
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    const { data, error } = await supabaseAdmin
      .from('contacts')
      .select('*')
      .eq('id', params.id)
      .single();
    
    if (error) {
      console.error('Error fetching contact:', error);
      return NextResponse.json({ error: 'Failed to fetch contact' }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in contact GET route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/contacts/[id] - Update a specific contact
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clerkId = getCurrentUser();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const hasAccess = await checkUserAccess('contacts', params.id);
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    const body = await req.json();
    
    // Validate required fields
    if (!body.first_name) {
      return NextResponse.json({ error: 'First name is required' }, { status: 400 });
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
      .eq('id', params.id)
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
  { params }: { params: { id: string } }
) {
  try {
    const clerkId = getCurrentUser();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const hasAccess = await checkUserAccess('contacts', params.id);
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    const { error } = await supabaseAdmin
      .from('contacts')
      .delete()
      .eq('id', params.id);
    
    if (error) {
      console.error('Error deleting contact:', error);
      return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 });
    }
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in contact DELETE route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 