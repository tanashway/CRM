import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getCurrentUserData } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';

// Define proper types instead of using 'any'
interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount?: number;
}

// GET /api/invoices - Get all invoices for the current user
export async function GET(req: NextRequest) {
  try {
    const clerkId = await getCurrentUser();
    
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
    
    // Build query - simplified to avoid join issues
    let query = supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false });
    
    // Add filters if provided
    if (status) {
      query = query.eq('status', status);
    }
    
    if (contactId) {
      query = query.eq('contact_id', contactId);
    }
    
    const { data: invoices, error: invoicesError } = await query;
    
    if (invoicesError) {
      console.error('Error fetching invoices:', invoicesError);
      return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
    }
    
    // If we have invoices, fetch contact details separately for each invoice
    if (invoices && invoices.length > 0) {
      // Get unique contact IDs
      const contactIds = [...new Set(invoices.map(invoice => invoice.contact_id))];
      
      // Fetch contacts
      const { data: contacts, error: contactsError } = await supabaseAdmin
        .from('contacts')
        .select('*')
        .in('id', contactIds);
      
      if (contactsError) {
        console.error('Error fetching contacts:', contactsError);
        // Return invoices without contact details
        return NextResponse.json(invoices);
      }
      
      // Create a map of contact ID to contact data
      const contactMap = contacts.reduce((map, contact) => {
        map[contact.id] = contact;
        return map;
      }, {});
      
      // Add contact data to each invoice
      const invoicesWithContacts = invoices.map(invoice => ({
        ...invoice,
        contacts: contactMap[invoice.contact_id] || null
      }));
      
      return NextResponse.json(invoicesWithContacts);
    }
    
    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error in invoices GET route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/invoices - Create a new invoice
export async function POST(req: NextRequest) {
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
    console.log('Received invoice data:', body);
    
    // Validate required fields
    if (!body.contact_id || !body.invoice_number || !body.issue_date || !body.due_date) {
      return NextResponse.json({ 
        error: 'Contact ID, invoice number, issue date, and due date are required' 
      }, { status: 400 });
    }
    
    // Validate contact belongs to user
    try {
      const { count, error: contactError } = await supabaseAdmin
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('id', body.contact_id)
        .eq('user_id', userData.id);
      
      if (contactError) {
        console.error('Contact validation error:', contactError);
        return NextResponse.json({ 
          error: 'Error validating contact',
          details: contactError.message
        }, { status: 500 });
      }
      
      if (count === 0) {
        return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
      }
    } catch (contactValidationError) {
      console.error('Exception during contact validation:', contactValidationError);
      return NextResponse.json({ 
        error: 'Exception during contact validation',
        details: contactValidationError instanceof Error ? contactValidationError.message : 'Unknown error'
      }, { status: 500 });
    }
    
    // Create the invoice with detailed error handling
    try {
      // First check if the invoices table exists
      const { error: tableCheckError } = await supabaseAdmin
        .from('invoices')
        .select('id')
        .limit(1);
      
      if (tableCheckError) {
        console.error('Error checking invoices table:', tableCheckError);
        return NextResponse.json({ 
          error: 'The invoices table may not exist or is not accessible',
          details: tableCheckError.message,
          code: tableCheckError.code
        }, { status: 500 });
      }
      
      // Proceed with invoice creation
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
        return NextResponse.json({ 
          error: 'Failed to create invoice',
          details: invoiceError.message,
          code: invoiceError.code,
          hint: invoiceError.hint || null
        }, { status: 500 });
      }
      
      if (!invoice) {
        console.error('No invoice returned after creation');
        return NextResponse.json({ 
          error: 'No invoice returned after creation'
        }, { status: 500 });
      }
      
      console.log('Invoice created successfully:', invoice);
      
      return NextResponse.json(invoice, { status: 201 });
    } catch (invoiceCreationError) {
      console.error('Exception during invoice creation:', invoiceCreationError);
      return NextResponse.json({ 
        error: 'Exception during invoice creation',
        details: invoiceCreationError instanceof Error ? invoiceCreationError.message : 'Unknown error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in invoices POST route:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 