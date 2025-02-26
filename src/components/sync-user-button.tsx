import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export function SyncUserButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSync = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/sync-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync user');
      }
      
      toast({
        title: 'Success',
        description: data.message || 'User synced successfully',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error syncing user:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to sync user',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleSync} 
      disabled={isLoading}
      variant="outline"
      size="sm"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Syncing...
        </>
      ) : (
        'Sync Account'
      )}
    </Button>
  );
} 