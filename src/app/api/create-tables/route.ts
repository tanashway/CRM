import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  try {
    // Create a direct Supabase client with the service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Create the users table if it doesn't exist
    const createUsersTableSQL = `
      CREATE TABLE IF NOT EXISTS public.users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        clerk_id TEXT UNIQUE NOT NULL,
        email TEXT,
        first_name TEXT,
        last_name TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    const { error: usersError } = await supabase.rpc('exec_sql', { sql: createUsersTableSQL });
    
    // Create the contacts table if it doesn't exist
    const createContactsTableSQL = `
      CREATE TABLE IF NOT EXISTS public.contacts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        company TEXT,
        status TEXT DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    const { error: contactsError } = await supabase.rpc('exec_sql', { sql: createContactsTableSQL });
    
    // Create the invoices table if it doesn't exist
    const createInvoicesTableSQL = `
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
    
    const { error: invoicesError } = await supabase.rpc('exec_sql', { sql: createInvoicesTableSQL });
    
    // Create the invoice_items table if it doesn't exist
    const createInvoiceItemsTableSQL = `
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
    
    const { error: itemsError } = await supabase.rpc('exec_sql', { sql: createInvoiceItemsTableSQL });
    
    // Try alternative approach if the first one fails
    let alternativeResults = null;
    if (invoicesError || itemsError) {
      // Try using a different RPC function name
      const alternativeFunctionNames = ['execute_sql', 'run_sql', 'query'];
      
      for (const functionName of alternativeFunctionNames) {
        try {
          if (invoicesError) {
            const { error } = await supabase.rpc(functionName, { 
              sql_query: createInvoicesTableSQL 
            });
            
            if (!error) {
              alternativeResults = { 
                success: true, 
                message: `Created invoices table using ${functionName}` 
              };
              break;
            }
          }
        } catch (e) {
          // Continue trying other function names
        }
      }
    }
    
    return NextResponse.json({
      success: !usersError && !contactsError && !invoicesError && !itemsError,
      usersTable: usersError ? `Error: ${usersError.message}` : 'Created or already exists',
      contactsTable: contactsError ? `Error: ${contactsError.message}` : 'Created or already exists',
      invoicesTable: invoicesError ? `Error: ${invoicesError.message}` : 'Created or already exists',
      invoiceItemsTable: itemsError ? `Error: ${itemsError.message}` : 'Created or already exists',
      alternativeResults
    });
  } catch (error) {
    console.error('Error in create-tables route:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 });
  }
} 