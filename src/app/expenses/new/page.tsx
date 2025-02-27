import { use } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ExpenseForm } from '@/components/expenses/expense-form';

export default function NewExpensePage() {
  return (
    <div className="p-6 max-w-full">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/expenses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Record New Expense</h1>
      </div>
      
      <div className="border rounded-lg p-6 bg-card">
        <ExpenseForm />
      </div>
    </div>
  );
} 