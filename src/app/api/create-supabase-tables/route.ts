import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface TableResults {
  invoices: boolean | null;
  invoice_items: boolean | null;
  foreign_key: boolean | null;
  errors: Array<{
    table: string;
    message: string;
  }>;
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
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Create the tables using raw SQL
    const createTablesSQL = `
      -- Create extension if it doesn't exist
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      
      -- Create invoices table if it doesn't exist
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
      
      -- Create invoice_items table if it doesn't exist
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
      
      -- Add foreign key if it doesn't exist
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'invoice_items_invoice_id_fkey'
        ) THEN
          ALTER TABLE public.invoice_items 
          ADD CONSTRAINT invoice_items_invoice_id_fkey 
          FOREIGN KEY (invoice_id) 
          REFERENCES public.invoices(id) 
          ON DELETE CASCADE;
        END IF;
      END
      $$;
    `;
    
    // Try to execute SQL using RPC
    const { error } = await supabase.rpc('exec_sql', { sql: createTablesSQL });
    
    if (error) {
      console.error('Error creating tables:', error);
      
      // Try alternative approach - create tables one by one
      const results: TableResults = {
        invoices: null,
        invoice_items: null,
        foreign_key: null,
        errors: []
      };
      
      // Create invoices table
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
      
      try {
        const { error: invoicesError } = await supabase.rpc('exec_sql', { sql: createInvoicesSQL });
        results.invoices = invoicesError ? false : true;
        
        if (invoicesError) {
          results.errors.push({
            table: 'invoices',
            message: invoicesError.message
          });
        }
      } catch (e) {
        results.errors.push({
          table: 'invoices',
          message: e instanceof Error ? e.message : 'Unknown error'
        });
      }
      
      // Create invoice_items table
      const createInvoiceItemsSQL = `
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
      
      try {
        const { error: itemsError } = await supabase.rpc('exec_sql', { sql: createInvoiceItemsSQL });
        results.invoice_items = itemsError ? false : true;
        
        if (itemsError) {
          results.errors.push({
            table: 'invoice_items',
            message: itemsError.message
          });
        }
      } catch (e) {
        results.errors.push({
          table: 'invoice_items',
          message: e instanceof Error ? e.message : 'Unknown error'
        });
      }
      
      // Add foreign key constraint
      const addForeignKeySQL = `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'invoice_items_invoice_id_fkey'
          ) THEN
            ALTER TABLE public.invoice_items 
            ADD CONSTRAINT invoice_items_invoice_id_fkey 
            FOREIGN KEY (invoice_id) 
            REFERENCES public.invoices(id) 
            ON DELETE CASCADE;
          END IF;
        END
        $$;
      `;
      
      try {
        const { error: fkError } = await supabase.rpc('exec_sql', { sql: addForeignKeySQL });
        results.foreign_key = fkError ? false : true;
        
        if (fkError) {
          results.errors.push({
            table: 'foreign_key',
            message: fkError.message
          });
        }
      } catch (e) {
        results.errors.push({
          table: 'foreign_key',
          message: e instanceof Error ? e.message : 'Unknown error'
        });
      }
      
      // Try SQL API as a last resort
      if (results.errors.length > 0) {
        try {
          // Try alternative RPC function names
          const alternativeFunctionNames = ['execute_sql', 'run_sql', 'query'];
          let alternativeSuccess = false;
          
          for (const functionName of alternativeFunctionNames) {
            try {
              const { error: altError } = await supabase.rpc(functionName, { 
                sql_query: createTablesSQL 
              });
              
              if (!altError) {
                alternativeSuccess = true;
                break;
              }
            } catch (e) {
              // Continue trying other function names
            }
          }
          
          if (alternativeSuccess) {
            return NextResponse.json({
              success: true,
              message: 'Tables created successfully using alternative RPC function',
              results
            });
          }
          
          // As a last resort, try direct HTTP request to Supabase
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              sql: createTablesSQL
            })
          });
          
          if (response.ok) {
            return NextResponse.json({
              success: true,
              message: 'Tables created successfully using direct API call',
              results
            });
          } else {
            const errorText = await response.text();
            return NextResponse.json({
              success: false,
              message: 'Failed to create tables using all methods',
              error: errorText,
              results
            }, { status: 500 });
          }
        } catch (e) {
          return NextResponse.json({
            success: false,
            message: 'All methods failed',
            error: e instanceof Error ? e.message : 'Unknown error',
            results
          }, { status: 500 });
        }
      }
      
      return NextResponse.json({
        success: results.invoices && results.invoice_items,
        message: results.errors.length === 0 ? 'Tables created successfully' : 'Some tables failed to create',
        results
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Tables created successfully'
    });
  } catch (error) {
    console.error('Error in create-supabase-tables route:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 });
  }
} 