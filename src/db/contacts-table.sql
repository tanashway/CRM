-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the contacts table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS contacts_user_id_idx ON contacts(user_id);
CREATE INDEX IF NOT EXISTS contacts_status_idx ON contacts(status);
CREATE INDEX IF NOT EXISTS contacts_company_idx ON contacts(company);
CREATE INDEX IF NOT EXISTS contacts_email_idx ON contacts(email);

-- Enable Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create policies for Row Level Security
-- Policy for users to select their own contacts
CREATE POLICY contacts_select_policy ON contacts
  FOR SELECT
  USING (user_id IN (
    SELECT id FROM users WHERE clerk_id = auth.uid()::text
  ));

-- Policy for users to insert their own contacts
CREATE POLICY contacts_insert_policy ON contacts
  FOR INSERT
  WITH CHECK (user_id IN (
    SELECT id FROM users WHERE clerk_id = auth.uid()::text
  ));

-- Policy for users to update their own contacts
CREATE POLICY contacts_update_policy ON contacts
  FOR UPDATE
  USING (user_id IN (
    SELECT id FROM users WHERE clerk_id = auth.uid()::text
  ));

-- Policy for users to delete their own contacts
CREATE POLICY contacts_delete_policy ON contacts
  FOR DELETE
  USING (user_id IN (
    SELECT id FROM users WHERE clerk_id = auth.uid()::text
  ));

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_contacts_updated_at
BEFORE UPDATE ON contacts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 