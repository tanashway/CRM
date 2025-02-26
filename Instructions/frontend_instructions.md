# Frontend Implementation Guidelines

## Project Structure

The frontend of the Personal CRM system is built using Next.js with the App Router and ShadCN UI components. The structure follows these conventions:

- `src/app`: Contains the main application routes and layouts
- `src/components`: Reusable UI components
- `src/lib`: Utility functions and shared code
- `src/hooks`: Custom React hooks
- `src/types`: TypeScript type definitions

## UI Components

### Dashboard
- Stats cards showing key metrics
- Activity feed displaying recent interactions
- Graphs for financial overview
- Quick action buttons

### Contacts
- Contact list with search and filter functionality
- Contact details view
- Add/Edit contact forms
- Contact activity history

### Invoices
- Invoice list with search and filter options
- Invoice creation form
- Invoice details view
- Payment status tracking

### Tasks
- Task list with priority indicators
- Calendar view for scheduled tasks
- Task creation and editing forms
- Task completion tracking

### AI Chat
- Chat interface for business queries
- Message history
- Query suggestions
- Response formatting for different data types

## Styling Guidelines

- Use ShadCN components for consistent UI
- Implement responsive design for all screen sizes
- Support dark mode throughout the application
- Follow accessibility best practices

## State Management

- Use React Context for global state where appropriate
- Implement React Query for server state management
- Use form libraries (like React Hook Form) for form handling

## Implementation Steps

1. Set up the base layout with navigation
2. Implement authentication UI with Clerk
3. Create dashboard components
4. Build contacts management interface
5. Develop invoicing system UI
6. Create task management components
7. Implement AI chat interface
8. Connect all components to the backend APIs

## Best Practices

- Use TypeScript for all components
- Implement proper error handling and loading states
- Optimize for performance with proper memoization
- Write unit tests for critical components
- Document component props and usage 
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