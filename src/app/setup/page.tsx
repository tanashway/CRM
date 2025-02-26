'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface SetupResponse {
  success: boolean;
  message: string;
  details?: {
    usersCreated?: boolean;
    contactsCreated?: boolean;
  };
}

export default function SetupPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [result, setResult] = useState<SetupResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const initializeDatabase = async () => {
    try {
      setStatus("loading");
      setResult(null);
      
      const response = await fetch('/api/init-db');
      const data = await response.json();
      
      setResult(data);
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Database initialized successfully',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to initialize database',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error initializing database:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to initialize database',
        variant: 'destructive',
      });
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Database Setup</CardTitle>
          <CardDescription>
            Initialize your database tables for the CRM application.
            This should only be used in development.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            This will create the following tables:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">users</code> - Stores user information synced from Clerk</li>
            <li><code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">contacts</code> - Stores contact information</li>
          </ul>
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md">
            <p className="text-sm font-mono">
              Note: This operation is safe to run multiple times. It will not delete existing data.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={initializeDatabase} 
            disabled={status === "loading"}
            className="w-full"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Initializing...
              </>
            ) : (
              'Initialize Database'
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {result && (
        <Card className="max-w-2xl mx-auto mt-6">
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 