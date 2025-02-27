'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Download, Share, ArrowLeft, Printer } from 'lucide-react';
import { toast } from 'sonner';

interface InvoiceItem {
  id?: string;
  invoice_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  status: string;
  total_amount: number;
  contact_id: string;
  notes: string;
  items?: InvoiceItem[];
  contacts?: {
    id: string;
    first_name?: string;
    last_name?: string;
    company?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    country?: string;
  } | null;
}

export default function InvoiceViewPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params using React.use()
  const unwrappedParams = use(params);
  const invoiceId = unwrappedParams.id;
  
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/invoices/${invoiceId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch invoice: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched invoice data:', data);
        setInvoice(data);
      } catch (err) {
        console.error('Error fetching invoice:', err);
        setError(err instanceof Error ? err.message : 'Failed to load invoice');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId]);

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

  // Get contact address
  const getContactAddress = (invoice: Invoice) => {
    if (!invoice.contacts) return null;
    
    const address = invoice.contacts.address || '';
    const city = invoice.contacts.city || '';
    const state = invoice.contacts.state || '';
    const zipCode = invoice.contacts.zip_code || '';
    const country = invoice.contacts.country || '';
    
    const addressParts = [
      address,
      [city, state, zipCode].filter(Boolean).join(', '),
      country
    ].filter(Boolean);
    
    return addressParts.length > 0 ? addressParts : null;
  };

  // Handle download invoice as PDF
  const handleDownloadInvoice = () => {
    // In a real implementation, this would call an API endpoint to generate and download the PDF
    window.open(`/api/invoices/${invoiceId}/pdf`, '_blank');
    toast.success('Downloading invoice PDF...');
  };

  // Handle share invoice link
  const handleShareInvoice = () => {
    // Generate a shareable link
    const shareableLink = `${window.location.origin}/invoices/public/${invoiceId}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareableLink)
      .then(() => {
        toast.success('Shareable link copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy link: ', err);
        toast.error('Failed to copy link to clipboard');
      });
  };

  // Handle print invoice
  const handlePrintInvoice = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Invoice</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading invoice data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Invoice</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-red-500">
            <p className="text-xl font-semibold">Error Loading Invoice</p>
            <p className="mt-2">{error || 'Invoice not found'}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => router.push('/invoices')}
            >
              Return to Invoices
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 print:py-0">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push('/invoices')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invoices
          </Button>
          <h1 className="text-3xl font-bold ml-4">Invoice {invoice.invoice_number}</h1>
          <div className="ml-4">{getStatusBadge(invoice.status)}</div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrintInvoice}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" onClick={handleShareInvoice}>
            <Share className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button onClick={handleDownloadInvoice}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 mb-6 print:shadow-none print:p-0">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">INVOICE</h2>
            <p className="text-gray-600 mt-1">#{invoice.invoice_number}</p>
          </div>
          <div className="text-right">
            <div className="text-gray-600">
              <p>Issue Date: {formatDate(invoice.issue_date)}</p>
              <p>Due Date: {formatDate(invoice.due_date)}</p>
              <p className="mt-2 font-semibold">Status: {invoice.status}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-gray-600 font-semibold mb-2">From</h3>
            <p className="font-bold">Your Company Name</p>
            <p>123 Business Street</p>
            <p>City, State 12345</p>
            <p>contact@yourcompany.com</p>
            <p>(123) 456-7890</p>
          </div>
          <div>
            <h3 className="text-gray-600 font-semibold mb-2">Bill To</h3>
            <p className="font-bold">{getContactName(invoice)}</p>
            {invoice.contacts?.email && <p>{invoice.contacts.email}</p>}
            {invoice.contacts?.phone && <p>{invoice.contacts.phone}</p>}
            {getContactAddress(invoice)?.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Quantity</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Unit Price</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items && invoice.items.length > 0 ? (
                invoice.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-3 px-4">{item.description}</td>
                    <td className="py-3 px-4 text-right">{item.quantity}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(item.unit_price)}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(item.amount)}</td>
                  </tr>
                ))
              ) : (
                <tr className="border-b border-gray-200">
                  <td colSpan={4} className="py-3 px-4 text-center text-gray-500">No items found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="w-64">
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="font-medium text-gray-600">Subtotal:</span>
              <span>{formatCurrency(invoice.total_amount)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="font-medium text-gray-600">Tax:</span>
              <span>{formatCurrency(0)}</span>
            </div>
            <div className="flex justify-between py-2 font-bold text-lg">
              <span>Total:</span>
              <span>{formatCurrency(invoice.total_amount)}</span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-8 border-t border-gray-200 pt-4">
            <h3 className="text-gray-600 font-semibold mb-2">Notes</h3>
            <p className="text-gray-700 whitespace-pre-line">{invoice.notes}</p>
          </div>
        )}

        <div className="mt-8 border-t border-gray-200 pt-4 text-center text-gray-500 text-sm">
          <p>Thank you for your business!</p>
        </div>
      </div>
    </div>
  );
} 