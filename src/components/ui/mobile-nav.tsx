'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Repeat,
  Receipt,
  FileText,
  FolderKanban,
  CheckSquare,
  HelpCircle,
  LogOut,
  ChevronDown,
  ChevronUp,
  Settings
} from 'lucide-react';

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { signOut } = useClerk();
  const router = useRouter();
  const [salesOpen, setSalesOpen] = useState(pathname.startsWith('/invoices'));
  
  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/');
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
    <div>
      <Button variant="ghost" size="icon" onClick={toggleMenu} className="h-10 w-10 text-white">
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>
      
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900 text-white">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <Link href="/" className="text-2xl font-bold" onClick={closeMenu}>
                Sela Grp
              </Link>
              <Button variant="ghost" size="icon" onClick={toggleMenu} className="h-10 w-10 text-white">
                <X className="h-6 w-6" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-auto p-4">
              <nav className="flex flex-col space-y-4">
                <Link href="/dashboard" onClick={closeMenu}>
                  <Button 
                    variant={isActive('/dashboard') ? "default" : "ghost"}
                    className={`w-full justify-start ${isActive('/dashboard') ? 'bg-slate-700 text-white' : 'text-white hover:text-white hover:bg-slate-800'}`}
                  >
                    <LayoutDashboard className="h-5 w-5 mr-3" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/contacts" onClick={closeMenu}>
                  <Button 
                    variant={isActive('/contacts') ? "default" : "ghost"}
                    className={`w-full justify-start ${isActive('/contacts') ? 'bg-slate-700 text-white' : 'text-white hover:text-white hover:bg-slate-800'}`}
                  >
                    <Users className="h-5 w-5 mr-3" />
                    Customers
                  </Button>
                </Link>
                <div className="space-y-1">
                  <Button 
                    variant={isActive('/invoices') ? "default" : "ghost"}
                    className={`w-full justify-between ${isActive('/invoices') ? 'bg-slate-700 text-white' : 'text-white hover:text-white hover:bg-slate-800'}`}
                    onClick={() => setSalesOpen(!salesOpen)}
                  >
                    <span className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-3" />
                      Sales
                    </span>
                    {salesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                  
                  {salesOpen && (
                    <div className="pl-8 space-y-1">
                      <Link href="/invoices" onClick={closeMenu}>
                        <Button 
                          variant={isActive('/invoices') ? "default" : "ghost"}
                          className={`w-full justify-start ${isActive('/invoices') ? 'bg-slate-600 text-white' : 'text-white hover:text-white hover:bg-slate-800'}`}
                          size="sm"
                        >
                          Invoices
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
                <Link href="/subscriptions" onClick={closeMenu}>
                  <Button 
                    variant={isActive('/subscriptions') ? "default" : "ghost"}
                    className={`w-full justify-start ${isActive('/subscriptions') ? 'bg-slate-700 text-white' : 'text-white hover:text-white hover:bg-slate-800'}`}
                  >
                    <Repeat className="h-5 w-5 mr-3" />
                    Subscriptions
                  </Button>
                </Link>
                <Link href="/expenses" onClick={closeMenu}>
                  <Button 
                    variant={isActive('/expenses') ? "default" : "ghost"}
                    className={`w-full justify-start ${isActive('/expenses') ? 'bg-slate-700 text-white' : 'text-white hover:text-white hover:bg-slate-800'}`}
                  >
                    <Receipt className="h-5 w-5 mr-3" />
                    Expenses
                  </Button>
                </Link>
                <Link href="/contracts" onClick={closeMenu}>
                  <Button 
                    variant={isActive('/contracts') ? "default" : "ghost"}
                    className={`w-full justify-start ${isActive('/contracts') ? 'bg-slate-700 text-white' : 'text-white hover:text-white hover:bg-slate-800'}`}
                  >
                    <FileText className="h-5 w-5 mr-3" />
                    Contracts
                  </Button>
                </Link>
                <Link href="/projects" onClick={closeMenu}>
                  <Button 
                    variant={isActive('/projects') ? "default" : "ghost"}
                    className={`w-full justify-start ${isActive('/projects') ? 'bg-slate-700 text-white' : 'text-white hover:text-white hover:bg-slate-800'}`}
                  >
                    <FolderKanban className="h-5 w-5 mr-3" />
                    Projects
                  </Button>
                </Link>
                <Link href="/tasks" onClick={closeMenu}>
                  <Button 
                    variant={isActive('/tasks') ? "default" : "ghost"}
                    className={`w-full justify-start ${isActive('/tasks') ? 'bg-slate-700 text-white' : 'text-white hover:text-white hover:bg-slate-800'}`}
                  >
                    <CheckSquare className="h-5 w-5 mr-3" />
                    Tasks
                  </Button>
                </Link>
                <Link href="/support" onClick={closeMenu}>
                  <Button 
                    variant={isActive('/support') ? "default" : "ghost"}
                    className={`w-full justify-start ${isActive('/support') ? 'bg-slate-700 text-white' : 'text-white hover:text-white hover:bg-slate-800'}`}
                  >
                    <HelpCircle className="h-5 w-5 mr-3" />
                    Support
                  </Button>
                </Link>
                
                <div className="border-t border-slate-800 pt-4 mt-4">
                  <Link href="/settings" onClick={closeMenu}>
                    <Button 
                      variant={isActive('/settings') ? "default" : "ghost"}
                      className={`w-full justify-start ${isActive('/settings') ? 'bg-slate-700 text-white' : 'text-white hover:text-white hover:bg-slate-800'}`}
                    >
                      <Settings className="h-5 w-5 mr-3" />
                      Settings
                    </Button>
                  </Link>
                </div>
              </nav>
            </div>
            
            <div className="p-4 border-t border-slate-800">
              <Button 
                className="w-full justify-start text-white hover:text-white hover:bg-slate-800"
                variant="ghost"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 