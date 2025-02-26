'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Database } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export function QuickFixButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFix = async () => {
    try {
      setIsLoading(true);
      
      // First, try to fix the database
      const dbResponse = await fetch('/api/fix-db');
      const dbData = await dbResponse.json();
      
      if (!dbResponse.ok) {
        throw new Error(dbData.error || 'Failed to fix database');
      }
      
      // Then, sync the current user
      const userResponse = await fetch('/api/sync-current-user');
      const userData = await userResponse.json();
      
      if (!userResponse.ok) {
        throw new Error(userData.error || 'Failed to sync user');
      }
      
      toast({
        title: 'Success',
        description: 'Database fixed and user synced successfully',
        variant: 'default',
      });
      
      // Reload the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error fixing issues:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fix issues',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleFix} 
      disabled={isLoading}
      variant="destructive"
      size="sm"
      className="fixed bottom-4 right-4 z-50 shadow-lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Fixing...
        </>
      ) : (
        <>
          <Database className="mr-2 h-4 w-4" />
          Quick Fix
        </>
      )}
    </Button>
  );
} 