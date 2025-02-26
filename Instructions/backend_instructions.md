# Backend Implementation Guidelines

## Database Structure (Supabase)

### Tables

1. **Users**
   - `id`: UUID (primary key)
   - `email`: String (unique)
   - `clerk_id`: String (unique)
   - `first_name`: String
   - `last_name`: String
   - `created_at`: Timestamp
   - `updated_at`: Timestamp

2. **Contacts**
   - `id`: UUID (primary key)
   - `user_id`: UUID (foreign key to Users)
   - `first_name`: String
   - `last_name`: String
   - `email`: String
   - `phone`: String
   - `company`: String
   - `position`: String
   - `notes`: Text
   - `status`: String (enum: 'active', 'inactive', 'lead', 'customer')
   - `created_at`: Timestamp
   - `updated_at`: Timestamp

3. **Invoices**
   - `id`: UUID (primary key)
   - `user_id`: UUID (foreign key to Users)
   - `contact_id`: UUID (foreign key to Contacts)
   - `invoice_number`: String
   - `issue_date`: Date
   - `due_date`: Date
   - `status`: String (enum: 'draft', 'sent', 'paid', 'overdue', 'cancelled')
   - `total_amount`: Decimal
   - `notes`: Text
   - `created_at`: Timestamp
   - `updated_at`: Timestamp

4. **Invoice_Items**
   - `id`: UUID (primary key)
   - `invoice_id`: UUID (foreign key to Invoices)
   - `description`: String
   - `quantity`: Integer
   - `unit_price`: Decimal
   - `total`: Decimal
   - `created_at`: Timestamp
   - `updated_at`: Timestamp

5. **Transactions**
   - `id`: UUID (primary key)
   - `user_id`: UUID (foreign key to Users)
   - `invoice_id`: UUID (foreign key to Invoices, nullable)
   - `amount`: Decimal
   - `type`: String (enum: 'income', 'expense')
   - `category`: String
   - `description`: String
   - `date`: Date
   - `created_at`: Timestamp
   - `updated_at`: Timestamp

6. **Tasks**
   - `id`: UUID (primary key)
   - `user_id`: UUID (foreign key to Users)
   - `contact_id`: UUID (foreign key to Contacts, nullable)
   - `title`: String
   - `description`: Text
   - `due_date`: Timestamp
   - `status`: String (enum: 'pending', 'in_progress', 'completed', 'cancelled')
   - `priority`: String (enum: 'low', 'medium', 'high')
   - `created_at`: Timestamp
   - `updated_at`: Timestamp

7. **AI_Logs**
   - `id`: UUID (primary key)
   - `user_id`: UUID (foreign key to Users)
   - `query`: Text
   - `response`: Text
   - `action_taken`: String
   - `created_at`: Timestamp

## Database Relationships

- Users have many Contacts, Invoices, Transactions, Tasks, and AI_Logs
- Contacts have many Invoices and Tasks
- Invoices have many Invoice_Items and Transactions

## API Routes

### Authentication
- `/api/auth/webhook`: Clerk webhook handler
- `/api/auth/user`: Get current user information

### Contacts
- `GET /api/contacts`: List all contacts
- `GET /api/contacts/:id`: Get a specific contact
- `POST /api/contacts`: Create a new contact
- `PUT /api/contacts/:id`: Update a contact
- `DELETE /api/contacts/:id`: Delete a contact

### Invoices
- `GET /api/invoices`: List all invoices
- `GET /api/invoices/:id`: Get a specific invoice with items
- `POST /api/invoices`: Create a new invoice with items
- `PUT /api/invoices/:id`: Update an invoice
- `DELETE /api/invoices/:id`: Delete an invoice
- `POST /api/invoices/:id/send`: Send an invoice to a contact

### Transactions
- `GET /api/transactions`: List all transactions
- `GET /api/transactions/:id`: Get a specific transaction
- `POST /api/transactions`: Create a new transaction
- `PUT /api/transactions/:id`: Update a transaction
- `DELETE /api/transactions/:id`: Delete a transaction

### Tasks
- `GET /api/tasks`: List all tasks
- `GET /api/tasks/:id`: Get a specific task
- `POST /api/tasks`: Create a new task
- `PUT /api/tasks/:id`: Update a task
- `DELETE /api/tasks/:id`: Delete a task

### AI
- `POST /api/ai/query`: Send a query to the AI
- `GET /api/ai/logs`: Get AI interaction logs

## Data Flow

1. Authentication flow:
   - User signs in via Clerk
   - Clerk webhook updates user data in Supabase
   - App receives authentication token

2. Data access flow:
   - Client makes authenticated request to Next.js API route
   - API route verifies authentication with Clerk
   - API route queries Supabase with appropriate permissions
   - Data is returned to the client

3. AI interaction flow:
   - User sends query to AI endpoint
   - Query is processed by 8n8 AI
   - AI interacts with Supabase to fetch or modify data
   - Response is logged and returned to the user

## Security Considerations

- Implement Row Level Security (RLS) in Supabase
- Use Clerk for authentication and authorization
- Validate all input data on the server
- Implement rate limiting for API endpoints
- Log all critical operations 
# project structure
CRM/
├── clerk/
├── crm-temp/
├── Instructions/
├── logs/
├── node_modules/
├── public/
├── src/
│   ├── app/
│   │   ├── ai/
│   │   ├── api/
│   │   │   ├── contacts/
│   │   │   │   └── [id]/
│   │   │   ├── dashboard/
│   │   │   │   ├── financial/
│   │   │   │   └── stats/
│   │   │   ├── invoices/
│   │   │   │   └── [id]/
│   │   │   ├── tasks/
│   │   │   │   └── [id]/
│   │   │   └── webhook/
│   │   │       └── clerk/
│   │   ├── contacts/
│   │   ├── dashboard/
│   │   ├── invoices/
│   │   ├── profile/
│   │   ├── sign-in/
│   │   │   └── [[...sign-in]]/
│   │   │       └── page.tsx
│   │   ├── sign-up/
│   │   │   └── [[...sign-up]]/
│   │   │       └── page.tsx
│   │   ├── tasks/
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ai/
│   │   └── ui/
│   │       └── navigation.tsx
│   ├── hooks/
│   ├── lib/
│   │   ├── auth.ts
│   │   └── supabase.ts
│   └── types/
├── .env.local
├── .gitignore
├── components.json
├── eslint.config.js
├── middleware.ts
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
├── tailwind.config.ts
└── tsconfig.json