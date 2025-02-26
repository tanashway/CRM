'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { MobileNav } from '@/components/ui/mobile-nav';
import { SyncUserButton } from '@/components/sync-user-button';

export function Navigation() {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const router = useRouter();
  
  const isActive = (path: string) => {
    return pathname === path;
  };
  
  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };
  
  return (
    <nav className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold mr-8">
            Personal CRM
          </Link>
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/dashboard">
              <Button 
                variant={isActive('/dashboard') ? 'default' : 'ghost'}
                className="text-sm"
              >
                Dashboard
              </Button>
            </Link>
            <Link href="/contacts">
              <Button 
                variant={isActive('/contacts') ? 'default' : 'ghost'}
                className="text-sm"
              >
                Contacts
              </Button>
            </Link>
            <Link href="/invoices">
              <Button 
                variant={isActive('/invoices') ? 'default' : 'ghost'}
                className="text-sm"
              >
                Invoices
              </Button>
            </Link>
            <Link href="/tasks">
              <Button 
                variant={isActive('/tasks') ? 'default' : 'ghost'}
                className="text-sm"
              >
                Tasks
              </Button>
            </Link>
            <Link href="/ai">
              <Button 
                variant={isActive('/ai') ? 'default' : 'ghost'}
                className="text-sm"
              >
                AI Assistant
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden md:block">
            <SyncUserButton />
            <Link href="/profile">
              <Button variant="outline" size="sm" className="ml-2">
                Profile
              </Button>
            </Link>
            <Button size="sm" onClick={handleSignOut} className="ml-2">
              Sign Out
            </Button>
          </div>
          <MobileNav />
        </div>
      </div>
    </nav>
  );
} 