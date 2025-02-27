 import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface TableError {
  table: string;
  message: string;
  code?: string;
}

interface TableCheckResults {
  users: boolean;
  contacts: boolean;
  invoices: boolean;
  invoice_items: boolean;
  errors: TableError[];
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
    
    // Check if tables exist
    const results: TableCheckResults = {
      users: false,
      contacts: false,
      invoices: false,
      invoice_items: false,
      errors: []
    };
    
    // Check users table
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      results.users = !usersError;
      
      if (usersError && usersError.code === '42P01') {
        results.errors.push({
          table: 'users',
          message: 'Table does not exist',
          code: usersError.code
        });
      }
    } catch (error) {
      results.errors.push({
        table: 'users',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Check contacts table
    try {
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('id')
        .limit(1);
      
      results.contacts = !contactsError;
      
      if (contactsError && contactsError.code === '42P01') {
        results.errors.push({
          table: 'contacts',
          message: 'Table does not exist',
          code: contactsError.code
        });
      }
    } catch (error) {
      results.errors.push({
        table: 'contacts',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Check invoices table
    try {
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select('id')
        .limit(1);
      
      results.invoices = !invoicesError;
      
      if (invoicesError && invoicesError.code === '42P01') {
        results.errors.push({
          table: 'invoices',
          message: 'Table does not exist',
          code: invoicesError.code
        });
      }
    } catch (error) {
      results.errors.push({
        table: 'invoices',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Check invoice_items table
    try {
      const { data: itemsData, error: itemsError } = await supabase
        .from('invoice_items')
        .select('id')
        .limit(1);
      
      results.invoice_items = !itemsError;
      
      if (itemsError && itemsError.code === '42P01') {
        results.errors.push({
          table: 'invoice_items',
          message: 'Table does not exist',
          code: itemsError.code
        });
      }
    } catch (error) {
      results.errors.push({
        table: 'invoice_items',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Check if all tables exist
    const allTablesExist = results.users && results.contacts && results.invoices && results.invoice_items;
    
    return NextResponse.json({
      success: allTablesExist,
      message: allTablesExist ? 'All tables exist' : 'Some tables are missing',
      results
    });
  } catch (error) {
    console.error('Error in check-tables route:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 });
  }
} 