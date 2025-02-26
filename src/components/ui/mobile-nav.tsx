'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
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
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  const closeMenu = () => {
    setIsOpen(false);
  };
  
  return (
    <div className="md:hidden">
      <Button variant="ghost" size="icon" onClick={toggleMenu} className="h-10 w-10">
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>
      
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <Link href="/" className="text-2xl font-bold" onClick={closeMenu}>
                Personal CRM
              </Link>
              <Button variant="ghost" size="icon" onClick={toggleMenu} className="h-10 w-10">
                <X className="h-6 w-6" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-auto p-4">
              <nav className="flex flex-col space-y-4">
                <Link href="/dashboard" onClick={closeMenu}>
                  <Button 
                    variant={isActive('/dashboard') ? 'default' : 'ghost'}
                    className="w-full justify-start"
                  >
                    Dashboard
                  </Button>
                </Link>
                <Link href="/contacts" onClick={closeMenu}>
                  <Button 
                    variant={isActive('/contacts') ? 'default' : 'ghost'}
                    className="w-full justify-start"
                  >
                    Contacts
                  </Button>
                </Link>
                <Link href="/invoices" onClick={closeMenu}>
                  <Button 
                    variant={isActive('/invoices') ? 'default' : 'ghost'}
                    className="w-full justify-start"
                  >
                    Invoices
                  </Button>
                </Link>
                <Link href="/tasks" onClick={closeMenu}>
                  <Button 
                    variant={isActive('/tasks') ? 'default' : 'ghost'}
                    className="w-full justify-start"
                  >
                    Tasks
                  </Button>
                </Link>
                <Link href="/ai" onClick={closeMenu}>
                  <Button 
                    variant={isActive('/ai') ? 'default' : 'ghost'}
                    className="w-full justify-start"
                  >
                    AI Assistant
                  </Button>
                </Link>
                <Link href="/profile" onClick={closeMenu}>
                  <Button 
                    variant={isActive('/profile') ? 'default' : 'ghost'}
                    className="w-full justify-start"
                  >
                    Profile
                  </Button>
                </Link>
              </nav>
            </div>
            
            <div className="p-4 border-t">
              <Button className="w-full" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 