'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Common expense categories
const EXPENSE_CATEGORIES = [
  'Office Supplies',
  'Travel',
  'Meals',
  'Rent',
  'Utilities',
  'Software',
  'Hardware',
  'Marketing',
  'Consulting',
  'Salaries',
  'Insurance',
  'Taxes',
  'Other'
];

// Payment modes
const PAYMENT_MODES = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'Check',
  'PayPal',
  'Other'
];

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  company: string | null;
}

interface Invoice {
  id: string;
  invoice_number: string;
}

interface ExpenseFormProps {
  expenseId?: string;
}

export function ExpenseForm({ expenseId }: ExpenseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  
  // Form state
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [project, setProject] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [invoiceId, setInvoiceId] = useState('');
  const [reference, setReference] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [notes, setNotes] = useState('');
  
  useEffect(() => {
    // Fetch contacts for dropdown
    const fetchContacts = async () => {
      try {
        const response = await fetch('/api/contacts');
        if (!response.ok) throw new Error('Failed to fetch contacts');
        const data = await response.json();
        setContacts(data.contacts || []);
      } catch (error) {
        console.error('Error fetching contacts:', error);
        toast.error('Failed to load contacts');
      }
    };
    
    // Fetch invoices for dropdown
    const fetchInvoices = async () => {
      try {
        const response = await fetch('/api/invoices');
        if (!response.ok) throw new Error('Failed to fetch invoices');
        const data = await response.json();
        setInvoices(data.invoices || []);
      } catch (error) {
        console.error('Error fetching invoices:', error);
        toast.error('Failed to load invoices');
      }
    };
    
    fetchContacts();
    fetchInvoices();
    
    // If editing an existing expense, fetch its data
    if (expenseId) {
      fetchExpense();
    }
  }, [expenseId]);
  
  const fetchExpense = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/expenses/${expenseId}`);
      if (!response.ok) throw new Error('Failed to fetch expense');
      
      const expense = await response.json();
      
      // Populate form with expense data
      setCategory(expense.category || '');
      setAmount(expense.amount?.toString() || '');
      setName(expense.name || '');
      setReceiptUrl(expense.receipt_url || '');
      setDate(expense.date ? new Date(expense.date) : new Date());
      setProject(expense.project || '');
      setCustomerId(expense.customer_id || '');
      setInvoiceId(expense.invoice_id || '');
      setReference(expense.reference || '');
      setPaymentMode(expense.payment_mode || '');
      setNotes(expense.notes || '');
    } catch (error) {
      console.error('Error fetching expense:', error);
      toast.error('Failed to load expense data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!category || !amount || !name || !date) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const expenseData = {
        category,
        amount: parseFloat(amount),
        name,
        receipt_url: receiptUrl || null,
        date: format(date, 'yyyy-MM-dd'),
        project: project || null,
        customer_id: customerId || null,
        invoice_id: invoiceId || null,
        reference: reference || null,
        payment_mode: paymentMode || null,
        notes: notes || null
      };
      
      const url = expenseId 
        ? `/api/expenses/${expenseId}` 
        : '/api/expenses';
      
      const method = expenseId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(expenseData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save expense');
      }
      
      toast.success(expenseId ? 'Expense updated successfully' : 'Expense recorded successfully');
      router.push('/expenses');
    } catch (error) {
      console.error('Error saving expense:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save expense');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading expense data...</span>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="category" className="required">Category</Label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          >
            <option value="">Select Category</option>
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="amount" className="required">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="name" className="required">Expense Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Office Rent, Software Subscription"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="date" className="required">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : 'Select date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="receipt_url">Receipt URL</Label>
          <Input
            id="receipt_url"
            value={receiptUrl}
            onChange={(e) => setReceiptUrl(e.target.value)}
            placeholder="https://example.com/receipt.pdf"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="project">Project</Label>
          <Input
            id="project"
            value={project}
            onChange={(e) => setProject(e.target.value)}
            placeholder="Project name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="customer_id">Customer</Label>
          <select
            id="customer_id"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select Customer (Optional)</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.company || `${contact.first_name} ${contact.last_name}`}
              </option>
            ))}
          </select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="invoice_id">Related Invoice</Label>
          <select
            id="invoice_id"
            value={invoiceId}
            onChange={(e) => setInvoiceId(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select Invoice (Optional)</option>
            {invoices.map((invoice) => (
              <option key={invoice.id} value={invoice.id}>
                {invoice.invoice_number}
              </option>
            ))}
          </select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="reference">Reference #</Label>
          <Input
            id="reference"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g., Receipt number, Transaction ID"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="payment_mode">Payment Mode</Label>
          <select
            id="payment_mode"
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select Payment Mode (Optional)</option>
            {PAYMENT_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional details about this expense"
          rows={4}
        />
      </div>
      
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/expenses')}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {expenseId ? 'Update Expense' : 'Record Expense'}
        </Button>
      </div>
    </form>
  );
} 