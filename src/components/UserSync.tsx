'use client';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

export function UserSync() {
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // Call the sync API route when the user is signed in
      fetch('/api/auth/sync')
        .catch(error => {
          console.error('Error syncing user:', error);
        });
    }
  }, [isSignedIn, isLoaded]);

  // This component doesn't render anything
  return null;
} 