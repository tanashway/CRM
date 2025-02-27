'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { 
  ChevronDown, 
  ChevronUp, 
  MoreHorizontal, 
  Edit, 
  Trash, 
  ArrowLeft, 
  ArrowRight,
  RefreshCcw
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface Expense {
  id: string;
  category: string;
  amount: number;
  name: string;
  receipt_url: string | null;
  date: string;
  project: string | null;
  customer_id: string | null;
  invoice_id: string | null;
  reference: string | null;
  payment_mode: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  contacts?: {
    id: string;
    first_name: string;
    last_name: string;
    company: string | null;
  } | null;
  invoices?: {
    id: string;
    invoice_number: string;
  } | null;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function ExpensesTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 25,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'date');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '25');
  const category = searchParams.get('category');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const search = searchParams.get('search');

  useEffect(() => {
    fetchExpenses();
  }, [page, limit, sortBy, sortOrder, category, startDate, endDate, search]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      
      if (category) params.append('category', category);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (search) params.append('search', search);
      
      const response = await fetch(`/api/expenses?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }
      
      const data = await response.json();
      setExpenses(data.expenses);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      // Toggle sort order if clicking the same column
      const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      setSortOrder(newOrder);
      updateSearchParams({ sortBy: column, sortOrder: newOrder });
    } else {
      // Default to descending when changing columns
      setSortBy(column);
      setSortOrder('desc');
      updateSearchParams({ sortBy: column, sortOrder: 'desc' });
    }
  };

  const updateSearchParams = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    
    Object.entries(params).forEach(([key, value]) => {
      newParams.set(key, value);
    });
    
    router.push(`/expenses?${newParams.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    updateSearchParams({ page: newPage.toString() });
  };

  const handleSelectAll = () => {
    if (selectedExpenses.length === expenses.length) {
      setSelectedExpenses([]);
    } else {
      setSelectedExpenses(expenses.map(expense => expense.id));
    }
  };

  const handleSelectExpense = (id: string) => {
    if (selectedExpenses.includes(id)) {
      setSelectedExpenses(selectedExpenses.filter(expenseId => expenseId !== id));
    } else {
      setSelectedExpenses([...selectedExpenses, id]);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete expense');
      }
      
      toast.success('Expense deleted successfully');
      fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense');
    }
  };

  const renderSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    
    return sortOrder === 'asc' ? 
      <ChevronUp className="h-4 w-4 ml-1" /> : 
      <ChevronDown className="h-4 w-4 ml-1" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {loading ? 'Loading...' : `Showing ${expenses.length} of ${pagination.total} expenses`}
        </div>
        <div className="flex items-center gap-2">
          <select 
            className="border rounded p-2 text-sm"
            value={limit}
            onChange={(e) => updateSearchParams({ limit: e.target.value, page: '1' })}
          >
            <option value="10">10 per page</option>
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </select>
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchExpenses}
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted text-muted-foreground text-sm">
            <tr>
              <th className="p-3 text-left">
                <Checkbox 
                  checked={selectedExpenses.length === expenses.length && expenses.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </th>
              <th 
                className="p-3 text-left cursor-pointer"
                onClick={() => handleSort('category')}
              >
                <div className="flex items-center">
                  Category
                  {renderSortIcon('category')}
                </div>
              </th>
              <th 
                className="p-3 text-left cursor-pointer"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center">
                  Amount
                  {renderSortIcon('amount')}
                </div>
              </th>
              <th 
                className="p-3 text-left cursor-pointer"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  Name
                  {renderSortIcon('name')}
                </div>
              </th>
              <th className="p-3 text-left">Receipt</th>
              <th 
                className="p-3 text-left cursor-pointer"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center">
                  Date
                  {renderSortIcon('date')}
                </div>
              </th>
              <th 
                className="p-3 text-left cursor-pointer"
                onClick={() => handleSort('project')}
              >
                <div className="flex items-center">
                  Project
                  {renderSortIcon('project')}
                </div>
              </th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Invoice</th>
              <th 
                className="p-3 text-left cursor-pointer"
                onClick={() => handleSort('reference')}
              >
                <div className="flex items-center">
                  Reference #
                  {renderSortIcon('reference')}
                </div>
              </th>
              <th 
                className="p-3 text-left cursor-pointer"
                onClick={() => handleSort('payment_mode')}
              >
                <div className="flex items-center">
                  Payment Mode
                  {renderSortIcon('payment_mode')}
                </div>
              </th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={12} className="p-4 text-center">Loading expenses...</td>
              </tr>
            ) : expenses.length === 0 ? (
              <tr>
                <td colSpan={12} className="p-4 text-center">No expenses found</td>
              </tr>
            ) : (
              expenses.map(expense => (
                <tr key={expense.id} className="hover:bg-muted/50">
                  <td className="p-3">
                    <Checkbox 
                      checked={selectedExpenses.includes(expense.id)}
                      onCheckedChange={() => handleSelectExpense(expense.id)}
                    />
                  </td>
                  <td className="p-3">
                    <Badge variant="outline">{expense.category}</Badge>
                  </td>
                  <td className="p-3 font-medium">
                    {formatCurrency(expense.amount)}
                  </td>
                  <td className="p-3">{expense.name}</td>
                  <td className="p-3">
                    {expense.receipt_url && (
                      <a 
                        href={expense.receipt_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </a>
                    )}
                  </td>
                  <td className="p-3">{formatDate(expense.date)}</td>
                  <td className="p-3">{expense.project || '-'}</td>
                  <td className="p-3">
                    {expense.contacts ? (
                      <Link 
                        href={`/contacts/${expense.customer_id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {expense.contacts.company || `${expense.contacts.first_name} ${expense.contacts.last_name}`}
                      </Link>
                    ) : '-'}
                  </td>
                  <td className="p-3">
                    {expense.invoices ? (
                      <Link 
                        href={`/invoices/${expense.invoice_id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {expense.invoices.invoice_number}
                      </Link>
                    ) : '-'}
                  </td>
                  <td className="p-3">{expense.reference || '-'}</td>
                  <td className="p-3">{expense.payment_mode || '-'}</td>
                  <td className="p-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/expenses/${expense.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDeleteExpense(expense.id)}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 