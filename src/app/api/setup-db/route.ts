import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const results: Record<string, any> = {};
    
    // Check if users table exists
    const { error: usersCheckError } = await supabaseAdmin
      .from('users')
      .select('id')
      .limit(1);
    
    if (usersCheckError && usersCheckError.code === 'PGRST204') {
      // Create users table
      const { error: createUsersError } = await supabaseAdmin.rpc('create_users_table');
      results.usersTable = createUsersError ? `Error: ${createUsersError.message}` : 'Created';
    } else {
      results.usersTable = 'Already exists';
    }
    
    // Check if contacts table exists
    const { error: contactsCheckError } = await supabaseAdmin
      .from('contacts')
      .select('id')
      .limit(1);
    
    if (contactsCheckError && contactsCheckError.code === 'PGRST204') {
      // Create contacts table
      const { error: createContactsError } = await supabaseAdmin.rpc('create_contacts_table');
      results.contactsTable = createContactsError ? `Error: ${createContactsError.message}` : 'Created';
    } else {
      results.contactsTable = 'Already exists';
    }
    
    // Check if invoices table exists
    const { error: invoicesCheckError } = await supabaseAdmin
      .from('invoices')
      .select('id')
      .limit(1);
    
    if (invoicesCheckError && invoicesCheckError.code === 'PGRST204') {
      // Create invoices table
      const { error: createInvoicesError } = await supabaseAdmin.rpc('create_invoices_table');
      
      if (createInvoicesError) {
        results.invoicesTable = `Error: ${createInvoicesError.message}`;
        
        // Try direct SQL approach
        const { error: sqlError } = await supabaseAdmin.rpc('execute_sql', {
          sql_query: `
            CREATE TABLE IF NOT EXISTS invoices (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
              contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
              invoice_number TEXT NOT NULL,
              issue_date DATE NOT NULL,
              due_date DATE NOT NULL,
              status TEXT NOT NULL DEFAULT 'draft',
              total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
              notes TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `
        });
        
        if (sqlError) {
          results.invoicesTableDirectSQL = `Error: ${sqlError.message}`;
        } else {
          results.invoicesTableDirectSQL = 'Created using direct SQL';
        }
      } else {
        results.invoicesTable = 'Created';
      }
    } else {
      results.invoicesTable = 'Already exists';
    }
    
    // Check if invoice_items table exists
    const { error: itemsCheckError } = await supabaseAdmin
      .from('invoice_items')
      .select('id')
      .limit(1);
    
    if (itemsCheckError && itemsCheckError.code === 'PGRST204') {
      // Create invoice_items table
      const { error: createItemsError } = await supabaseAdmin.rpc('create_invoice_items_table');
      
      if (createItemsError) {
        results.invoiceItemsTable = `Error: ${createItemsError.message}`;
        
        // Try direct SQL approach
        const { error: sqlError } = await supabaseAdmin.rpc('execute_sql', {
          sql_query: `
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
          `
        });
        
        if (sqlError) {
          results.invoiceItemsTableDirectSQL = `Error: ${sqlError.message}`;
        } else {
          results.invoiceItemsTableDirectSQL = 'Created using direct SQL';
        }
      } else {
        results.invoiceItemsTable = 'Created';
      }
    } else {
      results.invoiceItemsTable = 'Already exists';
    }
    
    return NextResponse.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Error in setup-db route:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 });
  }
} 