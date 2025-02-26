import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkUserAccess } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/invoices/[id] - Get a specific invoice with items
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clerkId = getCurrentUser();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const hasAccess = await checkUserAccess('invoices', params.id);
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    // Get invoice with contact and items
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .select(`
        *,
        contacts (
          id,
          first_name,
          last_name,
          email,
          phone,
          company
        )
      `)
      .eq('id', params.id)
      .single();
    
    if (invoiceError) {
      console.error('Error fetching invoice:', invoiceError);
      return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
    }
    
    // Get invoice items
    const { data: items, error: itemsError } = await supabaseAdmin
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', params.id)
      .order('created_at', { ascending: true });
    
    if (itemsError) {
      console.error('Error fetching invoice items:', itemsError);
      return NextResponse.json({ error: 'Failed to fetch invoice items' }, { status: 500 });
    }
    
    // Combine invoice and items
    const result = {
      ...invoice,
      items: items || [],
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in invoice GET route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/invoices/[id] - Update a specific invoice
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clerkId = getCurrentUser();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const hasAccess = await checkUserAccess('invoices', params.id);
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    const body = await req.json();
    
    // Validate required fields
    if (!body.contact_id || !body.invoice_number || !body.issue_date || !body.due_date) {
      return NextResponse.json({ 
        error: 'Contact ID, invoice number, issue date, and due date are required' 
      }, { status: 400 });
    }
    
    // Update invoice
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .update({
        contact_id: body.contact_id,
        invoice_number: body.invoice_number,
        issue_date: body.issue_date,
        due_date: body.due_date,
        status: body.status || 'draft',
        total_amount: body.total_amount || 0,
        notes: body.notes || '',
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();
    
    if (invoiceError) {
      console.error('Error updating invoice:', invoiceError);
      return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
    }
    
    // Update invoice items if provided
    if (body.items && Array.isArray(body.items)) {
      // First delete existing items
      const { error: deleteError } = await supabaseAdmin
        .from('invoice_items')
        .delete()
        .eq('invoice_id', params.id);
      
      if (deleteError) {
        console.error('Error deleting invoice items:', deleteError);
        return NextResponse.json({ error: 'Failed to update invoice items' }, { status: 500 });
      }
      
      // Then add new items
      if (body.items.length > 0) {
        const invoiceItems = body.items.map((item: any) => ({
          invoice_id: params.id,
          description: item.description || '',
          quantity: item.quantity || 1,
          unit_price: item.unit_price || 0,
          total: (item.quantity || 1) * (item.unit_price || 0),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
        
        const { error: insertError } = await supabaseAdmin
          .from('invoice_items')
          .insert(invoiceItems);
        
        if (insertError) {
          console.error('Error creating invoice items:', insertError);
          return NextResponse.json({ error: 'Failed to update invoice items' }, { status: 500 });
        }
      }
    }
    
    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error in invoice PUT route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/invoices/[id] - Delete a specific invoice
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clerkId = getCurrentUser();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const hasAccess = await checkUserAccess('invoices', params.id);
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    // Delete invoice (cascade will delete items)
    const { error } = await supabaseAdmin
      .from('invoices')
      .delete()
      .eq('id', params.id);
    
    if (error) {
      console.error('Error deleting invoice:', error);
      return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 });
    }
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in invoice DELETE route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 