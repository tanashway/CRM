import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    // Try to get the structure by selecting a single row
    const { data, error } = await supabaseAdmin
      .from('invoice_items')
      .select('*')
      .limit(1);
    
    if (error) {
      return NextResponse.json({ 
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      }, { status: 500 });
    }
    
    // Try to get column information
    let columns = null;
    let columnsError = null;
    
    try {
      const result = await supabaseAdmin
        .rpc('get_columns_info', { table_name: 'invoice_items' });
      columns = result.data;
      columnsError = result.error ? result.error.message : null;
    } catch (e) {
      columnsError = 'RPC not available';
    }
    
    return NextResponse.json({ 
      data,
      columns,
      columnsError
    });
  } catch (error) {
    console.error('Error in test route:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 });
  }
} 