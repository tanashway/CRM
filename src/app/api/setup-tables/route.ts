import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    // Create the invoices table
    const { error: invoicesError } = await supabaseAdmin
      .from('invoices')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        contact_id: '00000000-0000-0000-0000-000000000000',
        invoice_number: 'TEST-0000',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date().toISOString().split('T')[0],
        status: 'draft',
        total_amount: 0,
        notes: 'Test invoice',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    
    // Check if we need to create the table
    let invoicesCreated = false;
    if (invoicesError && (invoicesError.code === 'PGRST204' || invoicesError.code === '42P01')) {
      // Try to create the table using SQL
      const createInvoicesSQL = `
        CREATE TABLE IF NOT EXISTS public.invoices (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL,
          contact_id UUID NOT NULL,
          invoice_number TEXT NOT NULL,
          issue_date DATE NOT NULL,
          due_date DATE NOT NULL,
          status TEXT NOT NULL DEFAULT 'draft',
          total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      
      const { error: createInvoicesError } = await supabaseAdmin.rpc('execute_sql', { 
        sql_query: createInvoicesSQL 
      });
      
      if (createInvoicesError) {
        return NextResponse.json({ 
          error: 'Failed to create invoices table',
          details: createInvoicesError.message
        }, { status: 500 });
      }
      
      invoicesCreated = true;
    }
    
    // Create the invoice_items table
    const { error: itemsError } = await supabaseAdmin
      .from('invoice_items')
      .insert({
        invoice_id: '00000000-0000-0000-0000-000000000000',
        description: 'Test item',
        quantity: 1,
        unit_price: 0,
        amount: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    
    // Check if we need to create the table
    let itemsCreated = false;
    if (itemsError && (itemsError.code === 'PGRST204' || itemsError.code === '42P01')) {
      // Try to create the table using SQL
      const createItemsSQL = `
        CREATE TABLE IF NOT EXISTS public.invoice_items (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          invoice_id UUID NOT NULL,
          description TEXT NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 1,
          unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
          amount DECIMAL(10,2) NOT NULL DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      
      const { error: createItemsError } = await supabaseAdmin.rpc('execute_sql', { 
        sql_query: createItemsSQL 
      });
      
      if (createItemsError) {
        return NextResponse.json({ 
          error: 'Failed to create invoice_items table',
          details: createItemsError.message
        }, { status: 500 });
      }
      
      itemsCreated = true;
    }
    
    return NextResponse.json({
      success: true,
      invoicesTable: invoicesCreated ? 'Created' : 'Already exists',
      invoiceItemsTable: itemsCreated ? 'Created' : 'Already exists',
      invoicesError: invoicesError ? {
        message: invoicesError.message,
        code: invoicesError.code
      } : null,
      itemsError: itemsError ? {
        message: itemsError.message,
        code: itemsError.code
      } : null
    });
  } catch (error) {
    console.error('Error in setup-tables route:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 });
  }
} 