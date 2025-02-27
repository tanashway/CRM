import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface ErrorInfo {
  method: string;
  message: string;
  details?: string;
  statement?: string;
}

interface Results {
  methods_tried: string[];
  success: boolean;
  errors: ErrorInfo[];
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
    
    // SQL to create tables
    const createTablesSQL = `
      -- Create extension if it doesn't exist
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      
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
          ALTER TABLE invoice_items 
          ADD CONSTRAINT invoice_items_invoice_id_fkey 
          FOREIGN KEY (invoice_id) 
          REFERENCES invoices(id) 
          ON DELETE CASCADE;
        END IF;
      END
      $$;
    `;
    
    // Try different methods to execute SQL
    const results: Results = {
      methods_tried: [],
      success: false,
      errors: []
    };
    
    // Method 1: Try using PostgreSQL function
    try {
      results.methods_tried.push('postgresql_function');
      const { error } = await supabase.rpc('exec_sql', { query: createTablesSQL });
      
      if (error) {
        results.errors.push({
          method: 'postgresql_function',
          message: error.message,
          details: error.details
        });
      } else {
        results.success = true;
        return NextResponse.json({
          success: true,
          message: 'Tables created successfully using PostgreSQL function',
          results
        });
      }
    } catch (error) {
      results.errors.push({
        method: 'postgresql_function',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Method 2: Try using SQL query directly
    if (!results.success) {
      try {
        results.methods_tried.push('direct_sql');
        
        // Split SQL into separate statements
        const statements = createTablesSQL
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0);
        
        let allSucceeded = true;
        const statementResults = [];
        
        for (const statement of statements) {
          const { error } = await supabase.rpc('run_sql', { sql: statement + ';' });
          
          statementResults.push({
            statement: statement.substring(0, 50) + '...',
            success: !error,
            error: error ? error.message : null
          });
          
          if (error) {
            allSucceeded = false;
            results.errors.push({
              method: 'direct_sql',
              statement: statement.substring(0, 100) + '...',
              message: error.message,
              details: error.details
            });
          }
        }
        
        if (allSucceeded) {
          results.success = true;
          return NextResponse.json({
            success: true,
            message: 'Tables created successfully using direct SQL',
            statementResults,
            results
          });
        }
      } catch (error) {
        results.errors.push({
          method: 'direct_sql',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    // Method 3: Try using REST API
    if (!results.success) {
      try {
        results.methods_tried.push('rest_api');
        
        // Create tables using REST API
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/run_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({ sql: createTablesSQL })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          results.errors.push({
            method: 'rest_api',
            message: `HTTP error ${response.status}`,
            details: errorText
          });
        } else {
          results.success = true;
          return NextResponse.json({
            success: true,
            message: 'Tables created successfully using REST API',
            results
          });
        }
      } catch (error) {
        results.errors.push({
          method: 'rest_api',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    // If all methods failed
    return NextResponse.json({
      success: false,
      message: 'Failed to create tables using all available methods',
      results
    }, { status: 500 });
  } catch (error) {
    console.error('Error in sql-create-tables route:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 });
  }
} 