'use client';

import { useState, useEffect, use } from 'react';
import { format } from 'date-fns';
import { Download, Printer } from 'lucide-react';

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
  contact?: {
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

export default function PublicInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params using React.use()
  const unwrappedParams = use(params);
  const invoiceId = unwrappedParams.id;
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        // Use a public API endpoint that doesn't require authentication
        const response = await fetch(`/api/invoices/public/${invoiceId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch invoice: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched public invoice data:', data);
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
    if (!invoice.contact) return 'Unknown Contact';
    
    const firstName = invoice.contact.first_name || '';
    const lastName = invoice.contact.last_name || '';
    const company = invoice.contact.company || '';
    
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
    if (!invoice.contact) return null;
    
    const address = invoice.contact.address || '';
    const city = invoice.contact.city || '';
    const state = invoice.contact.state || '';
    const zipCode = invoice.contact.zip_code || '';
    const country = invoice.contact.country || '';
    
    const addressParts = [
      address,
      [city, state, zipCode].filter(Boolean).join(', '),
      country
    ].filter(Boolean);
    
    return addressParts.length > 0 ? addressParts : null;
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 print:py-0">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">Invoice {invoice.invoice_number}</h1>
        </div>
        <div className="flex gap-2">
          <button 
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={handlePrintInvoice}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </button>
          <a 
            href={`/api/invoices/public/${invoiceId}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </a>
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
            {invoice.contact?.email && <p>{invoice.contact.email}</p>}
            {invoice.contact?.phone && <p>{invoice.contact.phone}</p>}
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