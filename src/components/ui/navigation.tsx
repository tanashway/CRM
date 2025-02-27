'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { MobileNav } from '@/components/ui/mobile-nav';
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

export function Navigation() {
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
  
  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-slate-900 text-white z-30">
      <div className="p-4 border-b border-slate-800">
        <Link href="/" className="text-2xl font-bold">
          Sela Grp
        </Link>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          <li>
            <Link href="/dashboard">
              <Button 
                variant={isActive('/dashboard') ? "default" : "ghost"} 
                className={`w-full justify-start ${isActive('/dashboard') ? 'bg-slate-700 text-white' : 'text-white hover:text-white hover:bg-slate-800'}`}
              >
                <LayoutDashboard className="h-5 w-5 mr-3" />
                Dashboard
              </Button>
            </Link>
          </li>
          <li>
            <Link href="/contacts">
              <Button 
                variant={isActive('/contacts') ? "default" : "ghost"} 
                className={`w-full justify-start ${isActive('/contacts') ? 'bg-slate-700 text-white' : 'text-white hover:text-white hover:bg-slate-800'}`}
              >
                <Users className="h-5 w-5 mr-3" />
                Customers
              </Button>
            </Link>
          </li>
          <li className="space-y-1">
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
              <ul className="pl-8 space-y-1">
                <li>
                  <Link href="/invoices">
                    <Button 
                      variant={isActive('/invoices') ? "default" : "ghost"} 
                      className={`w-full justify-start ${isActive('/invoices') ? 'bg-slate-600 text-white' : 'text-white hover:text-white hover:bg-slate-800'}`}
                      size="sm"
                    >
                      Invoices
                    </Button>
                  </Link>
                </li>
              </ul>
            )}
          </li>
          <li>
            <Link href="/subscriptions">
              <Button 
                variant={isActive('/subscriptions') ? "default" : "ghost"} 
                className={`w-full justify-start ${isActive('/subscriptions') ? 'bg-slate-700 text-white' : 'text-white hover:text-white hover:bg-slate-800'}`}
              >
                <Repeat className="h-5 w-5 mr-3" />
                Subscriptions
              </Button>
            </Link>
          </li>
          <li>
            <Link href="/expenses">
              <Button 
                variant={isActive('/expenses') ? "default" : "ghost"} 
                className={`w-full justify-start ${isActive('/expenses') ? 'bg-slate-700 text-white' : 'text-white hover:text-white hover:bg-slate-800'}`}
              >
                <Receipt className="h-5 w-5 mr-3" />
                Expenses
              </Button>
            </Link>
          </li>
          <li>
            <Link href="/contracts">
              <Button 
                variant={isActive('/contracts') ? "default" : "ghost"} 
                className={`w-full justify-start ${isActive('/contracts') ? 'bg-slate-700 text-white' : 'text-white hover:text-white hover:bg-slate-800'}`}
              >
                <FileText className="h-5 w-5 mr-3" />
                Contracts
              </Button>
            </Link>
          </li>
          <li>
            <Link href="/projects">
              <Button 
                variant={isActive('/projects') ? "default" : "ghost"} 
                className={`w-full justify-start ${isActive('/projects') ? 'bg-slate-700 text-white' : 'text-white hover:text-white hover:bg-slate-800'}`}
              >
                <FolderKanban className="h-5 w-5 mr-3" />
                Projects
              </Button>
            </Link>
          </li>
          <li>
            <Link href="/tasks">
              <Button 
                variant={isActive('/tasks') ? "default" : "ghost"} 
                className={`w-full justify-start ${isActive('/tasks') ? 'bg-slate-700 text-white' : 'text-white hover:text-white hover:bg-slate-800'}`}
              >
                <CheckSquare className="h-5 w-5 mr-3" />
                Tasks
              </Button>
            </Link>
          </li>
          <li>
            <Link href="/support">
              <Button 
                variant={isActive('/support') ? "default" : "ghost"} 
                className={`w-full justify-start ${isActive('/support') ? 'bg-slate-700 text-white' : 'text-white hover:text-white hover:bg-slate-800'}`}
              >
                <HelpCircle className="h-5 w-5 mr-3" />
                Support
              </Button>
            </Link>
          </li>
        </ul>
      </nav>
      
      <div className="p-4 border-t border-slate-800 absolute bottom-0 w-full space-y-2">
        <Link href="/settings">
          <Button 
            variant={isActive('/settings') ? "default" : "ghost"} 
            className={`w-full justify-start ${isActive('/settings') ? 'bg-slate-700 text-white' : 'text-white hover:text-white hover:bg-slate-800'}`}
          >
            <Settings className="h-5 w-5 mr-3" />
            Settings
          </Button>
        </Link>
        
        <Button 
          variant="ghost" 
          className="w-full justify-start text-white hover:text-white hover:bg-slate-800"
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );
} 