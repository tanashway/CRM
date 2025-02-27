import { NextResponse } from 'next/server';
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
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const clerkId = await getCurrentUser();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user has access to this invoice
    const hasAccess = await checkUserAccess('invoices', params.id);
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    // First, get the basic invoice data without the join
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .select('*')
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
    
    // Try to get contact information separately
    let contact = null;
    if (invoice.contact_id) {
      const { data: contactData, error: contactError } = await supabaseAdmin
        .from('contacts')
        .select('id, first_name, last_name, email, company, phone')
        .eq('id', invoice.contact_id)
        .single();
      
      if (!contactError && contactData) {
        contact = contactData;
      } else {
        console.warn('Could not fetch contact for invoice:', contactError);
      }
    }
    
    return NextResponse.json({
      ...invoice,
      items: items || [],
      contacts: contact // Include contact data if available
    });
  } catch (error) {
    console.error('Error in invoice GET route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/invoices/[id] - Update an invoice
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const clerkId = await getCurrentUser();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user has access to this invoice
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
    
    // Handle invoice items
    if (body.items && Array.isArray(body.items)) {
      // Delete existing items
      const { error: deleteError } = await supabaseAdmin
        .from('invoice_items')
        .delete()
        .eq('invoice_id', params.id);
      
      if (deleteError) {
        console.error('Error deleting invoice items:', deleteError);
        return NextResponse.json({ error: 'Failed to update invoice items' }, { status: 500 });
      }
      
      // Add new items
      if (body.items.length > 0) {
        // Log the items we're trying to insert
        console.log('Attempting to insert invoice items:', body.items);
        
        // Simplify the items structure to only include essential fields
        const invoiceItems = body.items.map((item: Record<string, unknown>) => {
          const quantity = typeof item.quantity === 'number' ? item.quantity : 1;
          const unitPrice = typeof item.unit_price === 'number' ? item.unit_price : 0;
          const calculatedAmount = quantity * unitPrice;
          
          // Create a simplified item object with only essential fields
          return {
            invoice_id: params.id,
            description: item.description || '',
            quantity: quantity,
            unit_price: unitPrice,
            // Include both field names but as separate objects to try each one
          };
        });
        
        // Try inserting with 'amount' field
        try {
          const itemsWithAmount = invoiceItems.map((item: { invoice_id: string; description: string; quantity: number; unit_price: number }) => ({
            ...item,
            amount: item.quantity * item.unit_price
          }));
          
          const { error: insertError } = await supabaseAdmin
            .from('invoice_items')
            .insert(itemsWithAmount);
          
          if (insertError) {
            console.error('Error creating invoice items with amount field:', insertError);
            
            // If that fails, try with 'total' field
            const itemsWithTotal = invoiceItems.map((item: { invoice_id: string; description: string; quantity: number; unit_price: number }) => ({
              ...item,
              total: item.quantity * item.unit_price
            }));
            
            const { error: insertError2 } = await supabaseAdmin
              .from('invoice_items')
              .insert(itemsWithTotal);
            
            if (insertError2) {
              console.error('Error creating invoice items with total field:', insertError2);
              return NextResponse.json({ 
                error: 'Failed to update invoice items',
                details: insertError2.message,
                code: insertError2.code
              }, { status: 500 });
            }
          }
        } catch (error) {
          console.error('Exception when inserting invoice items:', error);
          return NextResponse.json({ 
            error: 'Failed to update invoice items',
            details: error instanceof Error ? error.message : 'Unknown error'
          }, { status: 500 });
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
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const clerkId = await getCurrentUser();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user has access to this invoice
    const hasAccess = await checkUserAccess('invoices', params.id);
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    // Delete invoice (items will be deleted via cascade)
    const { error: deleteError } = await supabaseAdmin
      .from('invoices')
      .delete()
      .eq('id', params.id);
    
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