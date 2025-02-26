import { Metadata } from 'next';
import { Navigation } from '@/components/ui/navigation';

export const metadata: Metadata = {
  title: 'Dashboard | Personal CRM',
  description: 'Manage your contacts, invoices, and tasks efficiently',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <div className="flex-1 bg-slate-50 dark:bg-slate-900">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
} 