'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path;
  };
  
  const settingsSections = [
    { name: 'General', path: '/settings/general' },
    { name: 'Company Information', path: '/settings/company' },
    { name: 'Localization', path: '/settings/localization' },
    { name: 'Email', path: '/settings/email' },
    { name: 'Finance', path: '/settings/finance' },
    { name: 'Subscriptions', path: '/settings/subscriptions' },
    { name: 'Payment Gateways', path: '/settings/payment-gateways' },
    { name: 'Customers', path: '/settings/customers' },
    { name: 'Tasks', path: '/settings/tasks' },
    { name: 'Support', path: '/settings/support' },
    { name: 'Leads', path: '/settings/leads' },
    { name: 'Calendar', path: '/settings/calendar' },
    { name: 'SMS', path: '/settings/sms' },
    { name: 'PDF', path: '/settings/pdf' },
    { name: 'E-Sign', path: '/settings/e-sign' },
    { name: 'Cron Job', path: '/settings/cron-job' },
    { name: 'Tags', path: '/settings/tags' },
    { name: 'Pusher.com', path: '/settings/pusher' },
    { name: 'Google', path: '/settings/google' },
    { name: 'Misc', path: '/settings/misc' },
  ];
  
  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
      {/* Settings Sidebar */}
      <div className="w-full md:w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Settings</h2>
          <div className="space-y-1 max-h-[calc(100vh-8rem)] overflow-y-auto">
            {settingsSections.map((section) => (
              <Link key={section.path} href={section.path}>
                <Button
                  variant={isActive(section.path) ? "default" : "ghost"}
                  className={`w-full justify-start text-sm ${
                    isActive(section.path)
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
                      : 'text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  size="sm"
                >
                  {section.name}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  );
} 