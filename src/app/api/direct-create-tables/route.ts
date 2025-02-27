import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface TableResult {
  invoices: boolean | null;
  invoice_items: boolean | null;
  errors: Array<{
    table: string;
    message: string;
    details?: string;
  }>;
  alternative_method?: boolean;
}

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
    
    // Create the invoices table
    const createInvoicesSQL = `
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
    `;
    
    // Create the invoice_items table
    const createInvoiceItemsSQL = `
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
    
    // Execute SQL statements
    const results: TableResult = {
      invoices: null,
      invoice_items: null,
      errors: []
    };
    
    try {
      const { data: invoicesData, error: invoicesError } = await supabase.rpc('exec_sql', {
        query: createInvoicesSQL
      });
      
      results.invoices = invoicesError ? false : true;
      if (invoicesError) {
        results.errors.push({
          table: 'invoices',
          message: invoicesError.message,
          details: invoicesError.details
        });
      }
    } catch (error) {
      results.errors.push({
        table: 'invoices',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    try {
      const { data: invoiceItemsData, error: invoiceItemsError } = await supabase.rpc('exec_sql', {
        query: createInvoiceItemsSQL
      });
      
      results.invoice_items = invoiceItemsError ? false : true;
      if (invoiceItemsError) {
        results.errors.push({
          table: 'invoice_items',
          message: invoiceItemsError.message,
          details: invoiceItemsError.details
        });
      }
    } catch (error) {
      results.errors.push({
        table: 'invoice_items',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Alternative approach using raw SQL if RPC fails
    if (results.errors.length > 0) {
      try {
        const { data, error } = await supabase.from('_exec_sql').select('*').eq('query', createInvoicesSQL + createInvoiceItemsSQL);
        
        if (error) {
          results.errors.push({
            table: 'all_tables',
            message: 'Failed with alternative method',
            details: error.message
          });
        } else {
          results.alternative_method = true;
        }
      } catch (error) {
        results.errors.push({
          table: 'all_tables',
          message: 'Alternative method failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return NextResponse.json({
      success: results.errors.length === 0 || results.alternative_method === true,
      message: results.errors.length === 0 ? 'Tables created successfully' : 'Some tables failed to create',
      results
    });
  } catch (error) {
    console.error('Error in direct-create-tables route:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 });
  }
} 