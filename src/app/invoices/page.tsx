'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronDown, Filter, Eye, Edit, Download, Share } from 'lucide-react';

// Define the Invoice type
interface Invoice {
  id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  status: string;
  total_amount: number;
  contact_id: string;
  contacts?: {
    id: string;
    first_name?: string;
    last_name?: string;
    company?: string;
    email?: string;
  } | null;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/invoices');
        
        if (!response.ok) {
          throw new Error('Failed to fetch invoices');
        }
        
        const data = await response.json();
        console.log('Fetched invoices:', data);
        setInvoices(data);
        setFilteredInvoices(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching invoices:', err);
        setError('Failed to load invoices. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  // Apply filters when status filter changes
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredInvoices(invoices);
    } else {
      setFilteredInvoices(invoices.filter(invoice => 
        invoice.status?.toLowerCase() === statusFilter.toLowerCase()
      ));
    }
  }, [statusFilter, invoices]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.filter-dropdown') && !target.closest('.filter-button') && 
          !target.closest('.action-dropdown')) {
        setShowFilterDropdown(false);
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Function to get status badge color
  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase() || 'draft') {
      case 'paid':
        return <Badge className="bg-green-500">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-red-500">Overdue</Badge>;
      case 'unpaid':
        return <Badge className="bg-red-500">Unpaid</Badge>;
      case 'partially paid':
        return <Badge className="bg-blue-500">Partially Paid</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-500">Cancelled</Badge>;
      case 'draft':
      default:
        return <Badge className="bg-gray-500">Draft</Badge>;
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  // Format date safely
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MM/dd/yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Get contact name
  const getContactName = (invoice: Invoice) => {
    if (!invoice.contacts) return 'Unknown Contact';
    
    const firstName = invoice.contacts.first_name || '';
    const lastName = invoice.contacts.last_name || '';
    const company = invoice.contacts.company || '';
    
    const name = `${firstName} ${lastName}`.trim();
    
    if (name && company) {
      return `${name} - ${company}`;
    } else if (company) {
      return company;
    } else if (name) {
      return name;
    } else {
      return 'Unknown Contact';
    }
  };

  // Handle view invoice
  const handleViewInvoice = (e: React.MouseEvent, invoiceId: string) => {
    e.stopPropagation();
    window.open(`/invoices/${invoiceId}`, '_blank');
  };

  // Handle edit invoice
  const handleEditInvoice = (e: React.MouseEvent, invoiceId: string) => {
    e.stopPropagation();
    window.location.href = `/invoices/${invoiceId}/edit`;
  };

  // Handle download invoice as PDF
  const handleDownloadInvoice = (e: React.MouseEvent, invoiceId: string) => {
    e.stopPropagation();
    // In a real implementation, this would call an API endpoint to generate and download the PDF
    window.open(`/api/invoices/${invoiceId}/pdf`, '_blank');
  };

  // Handle share invoice link
  const handleShareInvoice = (e: React.MouseEvent, invoiceId: string) => {
    e.stopPropagation();
    // Generate a shareable link
    const shareableLink = `${window.location.origin}/invoices/public/${invoiceId}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareableLink)
      .then(() => {
        alert('Shareable link copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy link: ', err);
      });
  };

  // Toggle action dropdown
  const toggleActionDropdown = (e: React.MouseEvent, invoiceId: string) => {
    e.stopPropagation();
    if (activeDropdown === invoiceId) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(invoiceId);
    }
  };

  // Filter options
  const filterOptions = [
    { id: 'all', label: 'All' },
    { id: 'not-sent', label: 'Not Sent' },
    { id: 'no-payment', label: 'Invoices with no payment records' },
    { id: 'recurring', label: 'Recurring Invoices' },
    { id: 'unpaid', label: 'Unpaid' },
    { id: 'paid', label: 'Paid' },
    { id: 'partially-paid', label: 'Partially Paid' },
    { id: 'overdue', label: 'Overdue' },
    { id: 'cancelled', label: 'Cancelled' },
    { id: 'draft', label: 'Draft' },
    { id: '2025', label: '2025' },
    { id: '2024', label: '2024' },
    { id: '2023', label: '2023' },
    { id: 'sale-agent', label: 'Sale Agent' },
    { id: 'payment-bank', label: 'Made Payment by Bank' },
    { id: 'payment-paypal', label: 'Made Payment by PayPal' },
    { id: 'payment-stripe', label: 'Made Payment by Stripe Checkout' },
  ];

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <Link href="/invoices/new">
          <Button>Create Invoice</Button>
        </Link>
      </div>
      
      <div className="mb-6 flex justify-between items-center">
        <div className="relative">
          <Button 
            variant="outline" 
            className="filter-button flex items-center gap-2"
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
          >
            <Filter size={16} />
            <span>Filter</span>
            <ChevronDown size={16} />
          </Button>
          
          {showFilterDropdown && (
            <div className="filter-dropdown absolute z-10 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg">
              <div className="py-1 max-h-96 overflow-y-auto">
                {filterOptions.map((option) => (
                  <button
                    key={option.id}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                      statusFilter === option.id ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                    onClick={() => {
                      setStatusFilter(option.id);
                      setShowFilterDropdown(false);
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={statusFilter === 'paid' ? 'default' : 'outline'} 
            onClick={() => setStatusFilter('paid')}
            className="text-sm bg-green-500 hover:bg-green-600"
          >
            Paid
          </Button>
          <Button 
            variant={statusFilter === 'unpaid' ? 'default' : 'outline'} 
            onClick={() => setStatusFilter('unpaid')}
            className="text-sm bg-red-500 hover:bg-red-600"
          >
            Unpaid
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Invoice Management</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            // Loading state
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-md">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-4 w-[100px]" />
                  </div>
                  <Skeleton className="h-6 w-[80px]" />
                </div>
              ))}
            </div>
          ) : error ? (
            // Error state
            <div className="text-center text-red-500 p-4">
              {error}
            </div>
          ) : filteredInvoices.length === 0 ? (
            // Empty state
            <div className="border rounded-md p-4">
              <div className="text-center text-muted-foreground">
                {invoices.length === 0 
                  ? "No invoices found. Create your first invoice to get started."
                  : "No invoices match the selected filter."}
              </div>
            </div>
          ) : (
            // Invoices list with table layout
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Invoice #</th>
                    <th className="text-left py-3 px-4 font-medium">Customer</th>
                    <th className="text-left py-3 px-4 font-medium">Issue Date</th>
                    <th className="text-left py-3 px-4 font-medium">Due Date</th>
                    <th className="text-right py-3 px-4 font-medium">Amount</th>
                    <th className="text-center py-3 px-4 font-medium">Status</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr 
                      key={invoice.id} 
                      className="border-b hover:bg-gray-50 group relative"
                      onClick={() => window.location.href = `/invoices/${invoice.id}`}
                    >
                      <td className="py-3 px-4">{invoice.invoice_number || 'No Invoice Number'}</td>
                      <td className="py-3 px-4">{getContactName(invoice)}</td>
                      <td className="py-3 px-4">{formatDate(invoice.issue_date)}</td>
                      <td className="py-3 px-4">{formatDate(invoice.due_date)}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(invoice.total_amount)}</td>
                      <td className="py-3 px-4 text-center">{getStatusBadge(invoice.status)}</td>
                      <td className="py-3 px-4 text-right relative">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 w-8 p-0 bg-blue-50 hover:bg-blue-100 border-blue-200"
                            onClick={(e) => handleViewInvoice(e, invoice.id)}
                            title="View Invoice"
                          >
                            <Eye size={16} className="text-blue-600" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 w-8 p-0 bg-amber-50 hover:bg-amber-100 border-amber-200"
                            onClick={(e) => handleEditInvoice(e, invoice.id)}
                            title="Edit Invoice"
                          >
                            <Edit size={16} className="text-amber-600" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 w-8 p-0 bg-green-50 hover:bg-green-100 border-green-200"
                            onClick={(e) => handleDownloadInvoice(e, invoice.id)}
                            title="Download PDF"
                          >
                            <Download size={16} className="text-green-600" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 w-8 p-0 bg-purple-50 hover:bg-purple-100 border-purple-200"
                            onClick={(e) => handleShareInvoice(e, invoice.id)}
                            title="Share Invoice Link"
                          >
                            <Share size={16} className="text-purple-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 