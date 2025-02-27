import { use } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusIcon, DownloadIcon, FilterIcon, RefreshCcw } from 'lucide-react';
import { ExpensesTable } from '@/components/expenses/expenses-table';
import { ExpensesFilter } from '@/components/expenses/expenses-filter';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ExpensesPage() {
  return (
    <div className="p-6 max-w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Expenses</h1>
        <div className="flex gap-2">
          <Link href="/expenses/new">
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Record Expense
            </Button>
          </Link>
          <Link href="/expenses/import">
            <Button variant="outline">
              <DownloadIcon className="h-4 w-4 mr-2" />
              Import Expenses
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="space-y-6">
        <ExpensesFilter />
        
        <Suspense fallback={<ExpensesTableSkeleton />}>
          <ExpensesTable />
        </Suspense>
      </div>
    </div>
  );
}

function ExpensesTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-10 w-[200px]" />
      </div>
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted p-4">
          <div className="grid grid-cols-7 gap-4">
            {Array(7).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-6" />
            ))}
          </div>
        </div>
        <div className="divide-y">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="p-4">
              <div className="grid grid-cols-7 gap-4">
                {Array(7).fill(0).map((_, j) => (
                  <Skeleton key={j} className="h-6" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-10 w-[200px]" />
      </div>
    </div>
  );
} 