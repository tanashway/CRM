import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// GET /api/invoices/public/[id] - Get a specific invoice for public sharing
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    
    // First, get the basic invoice data without the join
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('id', params.id)
      .single();
    
    if (invoiceError) {
      console.error('Error fetching public invoice:', invoiceError);
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    
    // Get invoice items
    const { data: items, error: itemsError } = await supabaseAdmin
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', params.id)
      .order('created_at', { ascending: true });
    
    if (itemsError) {
      console.error('Error fetching public invoice items:', itemsError);
      return NextResponse.json({ error: 'Failed to fetch invoice items' }, { status: 500 });
    }
    
    // Try to get contact information separately
    let contact = null;
    if (invoice.contact_id) {
      const { data: contactData, error: contactError } = await supabaseAdmin
        .from('contacts')
        .select('id, first_name, last_name, email, company, phone, address, city, state, zip_code, country')
        .eq('id', invoice.contact_id)
        .single();
      
      if (!contactError && contactData) {
        contact = contactData;
      } else {
        console.warn('Could not fetch contact for public invoice:', contactError);
      }
    }
    
    // Return the invoice with items and contact
    return NextResponse.json({
      ...invoice,
      items: items || [],
      contact: contact
    });
  } catch (error) {
    console.error('Error in public invoice GET route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 