import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkUserAccess } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';

// Force a fresh build on Vercel
// Define proper types for invoice items
export interface InvoiceItemType {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

// GET /api/invoices/[id] - Get a specific invoice with items
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const clerkId = await getCurrentUser();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user has access to this invoice
    const hasAccess = await checkUserAccess('invoices', context.params.id);
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    // Get invoice with contact info
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .select(`
        *,
        contacts (
          id,
          first_name,
          last_name,
          email,
          company,
          phone
        )
      `)
      .eq('id', context.params.id)
      .single();
    
    if (invoiceError) {
      console.error('Error fetching invoice:', invoiceError);
      return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
    }
    
    // Get invoice items
    const { data: items, error: itemsError } = await supabaseAdmin
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', context.params.id)
      .order('created_at', { ascending: true });
    
    if (itemsError) {
      console.error('Error fetching invoice items:', itemsError);
      return NextResponse.json({ error: 'Failed to fetch invoice items' }, { status: 500 });
    }
    
    return NextResponse.json({
      ...invoice,
      items: items || [],
    });
  } catch (error) {
    console.error('Error in invoice GET route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/invoices/[id] - Update an invoice
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const clerkId = await getCurrentUser();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user has access to this invoice
    const hasAccess = await checkUserAccess('invoices', context.params.id);
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    const body = await request.json();
    
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
      .eq('id', context.params.id)
      .select()
      .single();
    
    if (invoiceError) {
      console.error('Error updating invoice:', invoiceError);
      return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
    }
    
    // Handle invoice items
    if (body.items && Array.isArray(body.items)) {
      // Delete existing items
      const { error: deleteError } = await supabaseAdmin
        .from('invoice_items')
        .delete()
        .eq('invoice_id', context.params.id);
      
      if (deleteError) {
        console.error('Error deleting invoice items:', deleteError);
        return NextResponse.json({ error: 'Failed to update invoice items' }, { status: 500 });
      }
      
      // Add new items
      if (body.items.length > 0) {
        const invoiceItems = body.items.map((item: Record<string, unknown>) => {
          const quantity = typeof item.quantity === 'number' ? item.quantity : 1;
          const unitPrice = typeof item.unit_price === 'number' ? item.unit_price : 0;
          
          return {
            invoice_id: context.params.id,
            description: item.description || '',
            quantity: quantity,
            unit_price: unitPrice,
            total: quantity * unitPrice,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        });
        
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

// DELETE /api/invoices/[id] - Delete an invoice
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const clerkId = await getCurrentUser();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user has access to this invoice
    const hasAccess = await checkUserAccess('invoices', context.params.id);
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    // Delete invoice (items will be deleted via cascade)
    const { error: deleteError } = await supabaseAdmin
      .from('invoices')
      .delete()
      .eq('id', context.params.id);
    
    if (deleteError) {
      console.error('Error deleting invoice:', deleteError);
      return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error in invoice DELETE route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 