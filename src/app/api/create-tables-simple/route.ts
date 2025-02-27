import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ 
        error: 'Supabase URL or key is missing' 
      }, { status: 500 });
    }
    
    // Create Supabase client with admin privileges
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Check if invoices table exists
    const { data: invoicesExists, error: invoicesCheckError } = await supabase
      .from('invoices')
      .select('id')
      .limit(1);
    
    let invoicesCreated = false;
    let invoiceItemsCreated = false;
    let errors = [];
    
    // If invoices table doesn't exist, create it
    if (invoicesCheckError && invoicesCheckError.code === '42P01') {
      const { error: createInvoicesError } = await supabase.rpc('create_invoices_table');
      
      if (createInvoicesError) {
        errors.push({
          table: 'invoices',
          message: createInvoicesError.message,
          details: createInvoicesError.details
        });
      } else {
        invoicesCreated = true;
      }
    } else {
      // Table already exists
      invoicesCreated = true;
    }
    
    // Check if invoice_items table exists
    const { data: invoiceItemsExists, error: invoiceItemsCheckError } = await supabase
      .from('invoice_items')
      .select('id')
      .limit(1);
    
    // If invoice_items table doesn't exist, create it
    if (invoiceItemsCheckError && invoiceItemsCheckError.code === '42P01') {
      const { error: createInvoiceItemsError } = await supabase.rpc('create_invoice_items_table');
      
      if (createInvoiceItemsError) {
        errors.push({
          table: 'invoice_items',
          message: createInvoiceItemsError.message,
          details: createInvoiceItemsError.details
        });
      } else {
        invoiceItemsCreated = true;
      }
    } else {
      // Table already exists
      invoiceItemsCreated = true;
    }
    
    // Try alternative method if RPC fails
    if (!invoicesCreated || !invoiceItemsCreated) {
      // Try to create tables using SQL directly
      const createTablesSQL = `
        -- Create invoices table if it doesn't exist
        CREATE TABLE IF NOT EXISTS invoices (
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
        
        -- Create invoice_items table if it doesn't exist
        CREATE TABLE IF NOT EXISTS invoice_items (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
          description TEXT NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 1,
          unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
          amount DECIMAL(10,2) NOT NULL DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      
      try {
        // Try using pgSQL function if available
        const { error: sqlError } = await supabase.rpc('run_sql', { sql: createTablesSQL });
        
        if (sqlError) {
          errors.push({
            table: 'all_tables',
            message: 'Failed to create tables using SQL',
            details: sqlError.message
          });
        } else {
          invoicesCreated = true;
          invoiceItemsCreated = true;
        }
      } catch (error) {
        errors.push({
          table: 'all_tables',
          message: 'Failed to run SQL',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return NextResponse.json({
      success: invoicesCreated && invoiceItemsCreated,
      invoicesCreated,
      invoiceItemsCreated,
      errors: errors.length > 0 ? errors : null
    });
  } catch (error) {
    console.error('Error in create-tables-simple route:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 });
  }
} 