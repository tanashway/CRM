import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This route creates the database tables directly
export async function GET(req: NextRequest) {
  try {
    // Create a Supabase client with the service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Try to enable the UUID extension
    try {
      await supabase.rpc('exec_sql', {
        sql_string: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
      });
    } catch (error) {
      console.log('Note: Could not enable UUID extension. Using gen_random_uuid() instead.');
    }

    // Try to create users table
    try {
      await supabase.rpc('exec_sql', {
        sql_string: `
          CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            clerk_id TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE,
            first_name TEXT,
            last_name TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          CREATE INDEX IF NOT EXISTS users_clerk_id_idx ON users (clerk_id);
        `
      });
      console.log('Users table created or already exists');
    } catch (error) {
      console.error('Error creating users table:', error);
      
      // Alternative approach if RPC fails
      const { error: directError } = await supabase.from('_manual_query').select('*').eq('query', `
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          clerk_id TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE,
          first_name TEXT,
          last_name TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      
      if (directError) {
        console.error('Alternative approach also failed:', directError);
      }
    }

    // Try to create contacts table
    try {
      await supabase.rpc('exec_sql', {
        sql_string: `
          CREATE TABLE IF NOT EXISTS contacts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            first_name TEXT NOT NULL,
            last_name TEXT,
            email TEXT,
            phone TEXT,
            company TEXT,
            position TEXT,
            notes TEXT,
            status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          CREATE INDEX IF NOT EXISTS contacts_user_id_idx ON contacts (user_id);
          CREATE INDEX IF NOT EXISTS contacts_status_idx ON contacts (status);
          CREATE INDEX IF NOT EXISTS contacts_company_idx ON contacts (company);
          CREATE INDEX IF NOT EXISTS contacts_email_idx ON contacts (email);
        `
      });
      console.log('Contacts table created or already exists');
    } catch (error) {
      console.error('Error creating contacts table:', error);
    }

    // Create a test user if none exists
    try {
      const { data: existingUsers } = await supabase.from('users').select('id').limit(1);
      
      if (!existingUsers || existingUsers.length === 0) {
        // Create a test user
        const { error: insertError } = await supabase.from('users').insert({
          clerk_id: 'test_user',
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        
        if (insertError) {
          console.error('Error creating test user:', insertError);
        } else {
          console.log('Test user created');
        }
      }
    } catch (error) {
      console.error('Error checking for existing users:', error);
    }

    return NextResponse.json({ 
      message: 'Database setup completed',
      tables: ['users', 'contacts']
    });
  } catch (error) {
    console.error('Error in fix-db route:', error);
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 });
  }
} 