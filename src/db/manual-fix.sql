-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Create a test user if needed (uncomment to use)
-- INSERT INTO users (clerk_id, email, first_name, last_name)
-- VALUES ('test_user', 'test@example.com', 'Test', 'User')
-- ON CONFLICT (clerk_id) DO NOTHING; 