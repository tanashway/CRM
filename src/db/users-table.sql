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

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for users to select their own data
CREATE POLICY users_select_policy ON users
  FOR SELECT
  USING (auth.uid()::text = clerk_id);

-- Create policy for users to insert their own data
CREATE POLICY users_insert_policy ON users
  FOR INSERT
  WITH CHECK (auth.uid()::text = clerk_id);

-- Create policy for users to update their own data
CREATE POLICY users_update_policy ON users
  FOR UPDATE
  USING (auth.uid()::text = clerk_id);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 