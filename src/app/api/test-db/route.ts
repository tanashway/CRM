import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    // Check if the invoices table exists
    const { data: invoicesData, error: invoicesError } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .limit(1);
    
    // Check if the invoice_items table exists
    const { data: itemsData, error: itemsError } = await supabaseAdmin
      .from('invoice_items')
      .select('*')
      .limit(1);
    
    // Get list of all tables in the database
    let tables = null;
    let tablesError = null;
    try {
      const result = await supabaseAdmin
        .rpc('get_tables');
      tables = result.data;
      tablesError = result.error ? result.error.message : null;
    } catch (e) {
      tablesError = 'RPC not available';
    }
    
    // Try to get the database schema version
    let schemaVersion = null;
    let schemaError = null;
    try {
      const result = await supabaseAdmin
        .from('schema_migrations')
        .select('*')
        .limit(1);
      schemaVersion = result.data;
      schemaError = result.error ? result.error.message : null;
    } catch (e) {
      schemaError = 'Table not found';
    }
    
    return NextResponse.json({
      invoicesTableExists: !invoicesError || invoicesError.code !== 'PGRST204',
      invoicesError: invoicesError ? {
        message: invoicesError.message,
        code: invoicesError.code,
        details: invoicesError.details
      } : null,
      
      itemsTableExists: !itemsError || itemsError.code !== 'PGRST204',
      itemsError: itemsError ? {
        message: itemsError.message,
        code: itemsError.code,
        details: itemsError.details
      } : null,
      
      tables,
      tablesError,
      
      schemaVersion,
      schemaError
    });
  } catch (error) {
    console.error('Error in test-db route:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 });
  }
} 