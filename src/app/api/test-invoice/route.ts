import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getCurrentUserData } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';

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
    
    // Get the first contact for testing
    const { data: contacts, error: contactsError } = await supabaseAdmin
      .from('contacts')
      .select('id')
      .eq('user_id', userData.id)
      .limit(1);
    
    if (contactsError || !contacts || contacts.length === 0) {
      return NextResponse.json({ 
        error: 'No contacts found',
        contactsError 
      }, { status: 404 });
    }
    
    const contactId = contacts[0].id;
    
    // Create a test invoice
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .insert({
        user_id: userData.id,
        contact_id: contactId,
        invoice_number: `TEST-${Math.floor(Math.random() * 10000)}`,
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'draft',
        total_amount: 100,
        notes: 'Test invoice',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (invoiceError) {
      return NextResponse.json({ 
        error: 'Failed to create invoice',
        invoiceError 
      }, { status: 500 });
    }
    
    // Try to create an invoice item
    const { data: invoiceItem, error: itemError } = await supabaseAdmin
      .from('invoice_items')
      .insert({
        invoice_id: invoice.id,
        description: 'Test item',
        quantity: 1,
        unit_price: 100,
        amount: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    return NextResponse.json({
      success: true,
      invoice,
      invoiceItem,
      itemError: itemError ? {
        message: itemError.message,
        details: itemError.details,
        hint: itemError.hint,
        code: itemError.code
      } : null
    });
  } catch (error) {
    console.error('Error in test-invoice route:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 });
  }
} 