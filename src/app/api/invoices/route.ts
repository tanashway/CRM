import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getCurrentUserData } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/invoices - Get all invoices for the current user
export async function GET(req: NextRequest) {
  try {
    const clerkId = getCurrentUser();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userData = await getCurrentUserData();
    
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get query parameters
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const contactId = url.searchParams.get('contact_id');
    
    // Build query
    let query = supabaseAdmin
      .from('invoices')
      .select(`
        *,
        contacts (
          id,
          first_name,
          last_name,
          email,
          company
        )
      `)
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false });
    
    // Add filters if provided
    if (status) {
      query = query.eq('status', status);
    }
    
    if (contactId) {
      query = query.eq('contact_id', contactId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching invoices:', error);
      return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in invoices GET route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/invoices - Create a new invoice
export async function POST(req: NextRequest) {
  try {
    const clerkId = getCurrentUser();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userData = await getCurrentUserData();
    
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const body = await req.json();
    
    // Validate required fields
    if (!body.contact_id || !body.invoice_number || !body.issue_date || !body.due_date) {
      return NextResponse.json({ 
        error: 'Contact ID, invoice number, issue date, and due date are required' 
      }, { status: 400 });
    }
    
    // Validate contact belongs to user
    const { count, error: contactError } = await supabaseAdmin
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('id', body.contact_id)
      .eq('user_id', userData.id);
    
    if (contactError || count === 0) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }
    
    // Start a transaction
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .insert({
        user_id: userData.id,
        contact_id: body.contact_id,
        invoice_number: body.invoice_number,
        issue_date: body.issue_date,
        due_date: body.due_date,
        status: body.status || 'draft',
        total_amount: body.total_amount || 0,
        notes: body.notes || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (invoiceError) {
      console.error('Error creating invoice:', invoiceError);
      return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
    }
    
    // Add invoice items if provided
    if (body.items && Array.isArray(body.items) && body.items.length > 0) {
      const invoiceItems = body.items.map((item: any) => ({
        invoice_id: invoice.id,
        description: item.description || '',
        quantity: item.quantity || 1,
        unit_price: item.unit_price || 0,
        total: (item.quantity || 1) * (item.unit_price || 0),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
      
      const { error: itemsError } = await supabaseAdmin
        .from('invoice_items')
        .insert(invoiceItems);
      
      if (itemsError) {
        console.error('Error creating invoice items:', itemsError);
        // Don't fail the whole request, but log the error
      }
    }
    
    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error('Error in invoices POST route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 