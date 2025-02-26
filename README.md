# Personal CRM System

A comprehensive Customer Relationship Management system that connects business operations, invoicing, financials, and AI-driven automation.

## Features

- **Dashboard**: View key metrics, activity feed, and financial overview
- **Contacts Management**: Store and manage customer information
- **Invoicing System**: Create, send, and track invoices
- **Task Management**: Schedule and track follow-ups and tasks
- **AI Assistant**: Execute business queries and automate workflows
- **Financial Tracking**: Monitor income, expenses, and financial performance

## Tech Stack

- **Frontend**: Next.js with ShadCN UI components
- **Backend**: Supabase (PostgreSQL database)
- **Authentication**: Clerk
- **AI Automation**: 8n8 AI agent

## Project Structure

```
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/              # API routes
│   │   ├── dashboard/        # Dashboard pages
│   │   ├── contacts/         # Contacts pages
│   │   ├── invoices/         # Invoices pages
│   │   ├── tasks/            # Tasks pages
│   │   ├── ai/               # AI chat interface
│   │   ├── sign-in/          # Authentication pages
│   │   ├── sign-up/
│   │   └── profile/
│   ├── components/           # Reusable UI components
│   │   ├── ui/               # ShadCN UI components
│   │   ├── dashboard/        # Dashboard-specific components
│   │   ├── contacts/         # Contacts-specific components
│   │   ├── invoices/         # Invoices-specific components
│   │   ├── tasks/            # Tasks-specific components
│   │   └── ai/               # AI-specific components
│   ├── lib/                  # Utility functions and shared code
│   ├── hooks/                # Custom React hooks
│   └── types/                # TypeScript type definitions
├── public/                   # Static assets
├── Instructions/             # Implementation guidelines
│   ├── frontend_instructions.md
│   ├── backend_instructions.md
│   ├── auth_instructions.md
│   ├── ai_instructions.md
│   └── deployment_instructions.md
├── logs/                     # Error logs
│   └── errors.md
├── middleware.ts             # Authentication middleware
├── next.config.ts            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
└── package.json              # Project dependencies
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Clerk account
- 8n8 AI account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/personal-crm.git
   cd personal-crm
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with the following variables:
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

4. Set up the database:
   - Follow the instructions in `Instructions/backend_instructions.md` to create the required tables in Supabase

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Implementation Guidelines

Detailed implementation guidelines are available in the `Instructions` folder:

- [Frontend Implementation](Instructions/frontend_instructions.md)
- [Backend Implementation](Instructions/backend_instructions.md)
- [Authentication Implementation](Instructions/auth_instructions.md)
- [AI Automation Implementation](Instructions/ai_instructions.md)
- [Deployment Instructions](Instructions/deployment_instructions.md)

## Deployment

The application can be deployed using Vercel (frontend) and Supabase (backend). Follow the instructions in [Deployment Instructions](Instructions/deployment_instructions.md) for detailed steps.

## Contributing

1. Follow the step-by-step process outlined in the project objectives
2. Execute one phase at a time and verify results before proceeding
3. Log each major change and decision in a structured format
4. Report any critical errors in `logs/errors.md`

## License

This project is licensed under the MIT License - see the LICENSE file for details.
