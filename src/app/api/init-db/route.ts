import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// GET /api/init-db - Initialize database tables
export async function GET() {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
    }

    // Enable UUID extension
    const { error: extensionError } = await supabaseAdmin.rpc('exec_sql', {
      sql_string: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
    });

    if (extensionError) {
      console.error('Error enabling UUID extension:', extensionError);
      return NextResponse.json({ error: 'Failed to enable UUID extension', details: extensionError }, { status: 500 });
    }

    // Create users table
    const { error: usersError } = await supabaseAdmin.rpc('exec_sql', {
      sql_string: `
        -- Create users table
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          clerk_id TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE,
          first_name TEXT,
          last_name TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create index on clerk_id for faster lookups
        CREATE INDEX IF NOT EXISTS users_clerk_id_idx ON users (clerk_id);
      `
    });

    if (usersError) {
      console.error('Error creating users table:', usersError);
      return NextResponse.json({ error: 'Failed to create users table', details: usersError }, { status: 500 });
    }

    // Create contacts table
    const { error: contactsError } = await supabaseAdmin.rpc('exec_sql', {
      sql_string: `
        -- Create contacts table
        CREATE TABLE IF NOT EXISTS contacts (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

        -- Create indexes for faster lookups
        CREATE INDEX IF NOT EXISTS contacts_user_id_idx ON contacts (user_id);
        CREATE INDEX IF NOT EXISTS contacts_status_idx ON contacts (status);
        CREATE INDEX IF NOT EXISTS contacts_company_idx ON contacts (company);
        CREATE INDEX IF NOT EXISTS contacts_email_idx ON contacts (email);
      `
    });

    if (contactsError) {
      console.error('Error creating contacts table:', contactsError);
      return NextResponse.json({ error: 'Failed to create contacts table', details: contactsError }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Database tables created successfully',
      tables: ['users', 'contacts']
    });
  } catch (error) {
    console.error('Error in init-db route:', error);
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 });
  }
} 