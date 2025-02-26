'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function FixDbPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoFixing, setIsAutoFixing] = useState(true);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  // Auto-run the fix when the page loads
  useEffect(() => {
    if (isAutoFixing) {
      fixDatabase();
      setIsAutoFixing(false);
    }
  }, [isAutoFixing]);

  const fixDatabase = async () => {
    try {
      setIsLoading(true);
      setResult(null);
      
      const response = await fetch('/api/fix-db');
      const data = await response.json();
      
      setResult(data);
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Database fixed successfully',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to fix database',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fixing database:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fix database',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Database Fix</CardTitle>
          <CardDescription>
            Fix your database tables for the CRM application.
            This page automatically attempts to fix your database when loaded.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            This will create the following tables if they don't exist:
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
            onClick={fixDatabase} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fixing...
              </>
            ) : (
              'Fix Database Again'
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
          <CardFooter className="flex justify-between">
            <Button 
              onClick={() => window.location.href = '/contacts'}
              variant="outline"
            >
              Go to Contacts
            </Button>
            <Button 
              onClick={() => window.location.href = '/dashboard'}
            >
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
} 