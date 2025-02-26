# AI Automation Implementation Guidelines

## 8n8 AI Integration

### Overview

The Personal CRM system integrates with 8n8 AI to provide intelligent automation for business operations. The AI agent can:

1. Execute business queries against the database
2. Schedule follow-ups and tasks
3. Analyze customer data and provide insights
4. Automate routine communications

### Setup Requirements

1. **8n8 AI Account**
   - Sign up for an 8n8 AI account
   - Create an API key for your application
   - Note your API endpoint and authentication credentials

2. **Environment Variables**
   - Add the following to your `.env.local` file:
     ```
     NEXT_PUBLIC_8N8_AI_ENDPOINT=your_endpoint
     8N8_AI_API_KEY=your_api_key
     ```

### Implementation Steps

#### 1. AI Service Setup

Create a service to handle AI interactions:

```tsx
// src/lib/ai-service.ts
import { createClient } from '@supabase/supabase-js';

interface AIQueryRequest {
  query: string;
  userId: string;
}

interface AIQueryResponse {
  response: string;
  actionTaken?: string;
  data?: any;
}

export async function processAIQuery({ query, userId }: AIQueryRequest): Promise<AIQueryResponse> {
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Log the query
    await supabase.from('ai_logs').insert({
      user_id: userId,
      query: query,
      created_at: new Date().toISOString(),
    });
    
    // Call 8n8 AI API
    const response = await fetch(process.env.NEXT_PUBLIC_8N8_AI_ENDPOINT || '', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.8N8_AI_API_KEY}`,
      },
      body: JSON.stringify({
        query,
        userId,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`AI request failed with status ${response.status}`);
    }
    
    const result = await response.json();
    
    // Update the AI log with the response
    await supabase
      .from('ai_logs')
      .update({
        response: result.response,
        action_taken: result.actionTaken || null,
      })
      .eq('user_id', userId)
      .eq('query', query)
      .order('created_at', { ascending: false })
      .limit(1);
    
    return result;
  } catch (error) {
    console.error('Error processing AI query:', error);
    throw error;
  }
}
```

#### 2. API Endpoint

Create an API endpoint to handle AI queries:

```tsx
// src/app/api/ai/query/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { processAIQuery } from '@/lib/ai-service';

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { query } = await req.json();
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }
    
    const result = await processAIQuery({
      query,
      userId,
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in AI query endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to process AI query' },
      { status: 500 }
    );
  }
}
```

#### 3. AI Chat Component

Create a chat interface for interacting with the AI:

```tsx
// src/components/ai/AIChat.tsx
'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export function AIChat() {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || !user) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Send query to AI
      const response = await fetch('/api/ai/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: input }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }
      
      const result = await response.json();
      
      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: result.response,
        role: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error processing your request.',
        role: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>AI Assistant</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px] overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Ask me anything about your business data
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your query..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Send'}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
```

### AI Query Types and Examples

The AI system should be able to handle the following types of queries:

#### 1. Data Retrieval Queries

- "Show me all unpaid invoices"
- "List all contacts from Company X"
- "What's the total revenue for last month?"
- "Show me tasks due this week"

#### 2. Action Queries

- "Schedule a follow-up with John Doe for next Tuesday"
- "Create a new invoice for ABC Corp"
- "Mark invoice #1234 as paid"
- "Send a reminder to clients with overdue invoices"

#### 3. Analysis Queries

- "Who are my top 5 clients by revenue?"
- "What's the average payment time for invoices?"
- "Show me the sales trend for the last 6 months"
- "Which clients haven't been contacted in the last 30 days?"

### Security Considerations

1. **Data Access Control**
   - The AI should only access data belonging to the authenticated user
   - Implement proper authorization checks before executing queries
   - Log all AI actions for audit purposes

2. **Input Validation**
   - Sanitize all user inputs before processing
   - Implement rate limiting to prevent abuse
   - Use parameterized queries to prevent SQL injection

3. **Output Sanitization**
   - Ensure sensitive data is not exposed in responses
   - Format responses appropriately for the UI
   - Handle errors gracefully without exposing system details

### Testing AI Integration

1. **Unit Tests**
   - Test AI service functions in isolation
   - Mock API responses for predictable testing
   - Verify error handling works correctly

2. **Integration Tests**
   - Test the complete flow from UI to AI service to database
   - Verify that data is correctly retrieved and displayed
   - Test authorization and authentication mechanisms

3. **User Acceptance Testing**
   - Create a set of sample queries for testing
   - Verify that the AI understands common business language
   - Test edge cases and complex queries 