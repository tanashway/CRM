# Deployment Instructions

## Prerequisites

Before deploying the Personal CRM system, ensure you have:

1. A GitHub repository with your project code
2. Accounts on:
   - [Vercel](https://vercel.com) (for frontend deployment)
   - [Supabase](https://supabase.com) (for backend deployment)
   - [Clerk](https://clerk.com) (for authentication)

## Environment Variables

Prepare the following environment variables for deployment:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# 8n8 AI
NEXT_PUBLIC_8N8_AI_ENDPOINT=your_8n8_ai_endpoint
8N8_AI_API_KEY=your_8n8_ai_api_key
```

## Supabase Deployment

### 1. Database Setup

1. Log in to your Supabase account and create a new project
2. Note your project URL and API keys
3. Create the required tables using the SQL editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contacts Table
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,
  position TEXT,
  notes TEXT,
  status TEXT CHECK (status IN ('active', 'inactive', 'lead', 'customer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices Table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status TEXT CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  total_amount DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice Items Table
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions Table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')),
  category TEXT,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks Table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Logs Table
CREATE TABLE ai_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  response TEXT,
  action_taken TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Row Level Security (RLS)

Set up Row Level Security to ensure data privacy:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for users
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid()::text = clerk_id);

-- Create policies for contacts
CREATE POLICY "Users can view their own contacts" ON contacts
  FOR SELECT USING (auth.uid() IN (SELECT clerk_id FROM users WHERE id = user_id));
  
CREATE POLICY "Users can insert their own contacts" ON contacts
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT clerk_id FROM users WHERE id = user_id));
  
CREATE POLICY "Users can update their own contacts" ON contacts
  FOR UPDATE USING (auth.uid() IN (SELECT clerk_id FROM users WHERE id = user_id));
  
CREATE POLICY "Users can delete their own contacts" ON contacts
  FOR DELETE USING (auth.uid() IN (SELECT clerk_id FROM users WHERE id = user_id));

-- Create similar policies for other tables
-- (invoices, invoice_items, transactions, tasks, ai_logs)
```

### 3. Supabase Functions (Optional)

If you need serverless functions for specific operations:

1. Navigate to the "Functions" tab in your Supabase dashboard
2. Create a new function (e.g., for complex queries or data processing)
3. Deploy the function and note its URL for use in your application

## Vercel Deployment

### 1. Prepare Your Project

1. Ensure your project has a proper `next.config.js` file
2. Verify that all dependencies are correctly listed in `package.json`
3. Make sure your project builds successfully locally with `npm run build`

### 2. Connect to GitHub

1. Push your code to a GitHub repository
2. Log in to Vercel and click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next

### 3. Environment Variables

1. Add all the environment variables listed above to your Vercel project
2. Ensure that client-side variables are prefixed with `NEXT_PUBLIC_`

### 4. Deploy

1. Click "Deploy" and wait for the build to complete
2. Once deployed, Vercel will provide a URL for your application
3. Test the application to ensure everything works correctly

## Clerk Configuration

### 1. Webhook Setup

1. In your Clerk dashboard, go to "Webhooks"
2. Create a new webhook endpoint with your Vercel URL:
   - Endpoint URL: `https://your-vercel-app.vercel.app/api/webhook/clerk`
   - Select events: `user.created`, `user.updated`, etc.
   - Get the signing secret and add it as `CLERK_WEBHOOK_SECRET` in Vercel

### 2. Redirect URLs

1. In your Clerk dashboard, go to "Redirect URLs"
2. Add your Vercel domain as an allowed redirect URL
3. Configure the sign-in and sign-up URLs to match your application

## 8n8 AI Integration

1. Set up your 8n8 AI account and create an API key
2. Configure the API endpoint and key in your Vercel environment variables
3. Test the AI integration to ensure it can access your Supabase database

## Post-Deployment Checks

After deploying, perform these checks:

1. **Authentication Flow**
   - Test sign-up, sign-in, and sign-out
   - Verify that user data is correctly stored in Supabase

2. **Data Operations**
   - Create, read, update, and delete contacts
   - Create and manage invoices
   - Track transactions
   - Create and complete tasks

3. **AI Functionality**
   - Test various AI queries
   - Verify that the AI can access and modify data
   - Check that AI logs are properly recorded

4. **Security**
   - Ensure that users can only access their own data
   - Verify that authentication tokens are properly handled
   - Check that sensitive operations require proper authentication

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Verify Supabase URL and API keys
   - Check network connectivity between Vercel and Supabase

2. **Authentication Problems**
   - Verify Clerk API keys
   - Check webhook configuration
   - Ensure redirect URLs are correctly set

3. **Build Failures**
   - Check build logs in Vercel
   - Verify dependencies and Node.js version
   - Test the build locally before deploying

4. **AI Integration Issues**
   - Verify 8n8 AI API keys and endpoint
   - Check permissions for AI to access Supabase
   - Review AI logs for error messages

## Maintenance

1. **Regular Updates**
   - Keep dependencies up to date
   - Monitor for security advisories
   - Update API keys periodically

2. **Monitoring**
   - Set up error tracking (e.g., Sentry)
   - Monitor API usage and database performance
   - Track user activity and system health

3. **Backups**
   - Configure regular database backups in Supabase
   - Document the restoration process
   - Test backups periodically 