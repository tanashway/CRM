'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, parse } from 'date-fns';
import { toast } from 'sonner';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  company: string | null;
  email: string;
}

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
  } | null;
}

export default function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params using React.use()
  const unwrappedParams = use(params);
  const invoiceId = unwrappedParams.id;
  
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedContact, setSelectedContact] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [issueDate, setIssueDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [status, setStatus] = useState('draft');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Calculate total
  const total = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch contacts
        const contactsResponse = await fetch('/api/contacts');
        if (!contactsResponse.ok) {
          console.error('Failed to fetch contacts:', contactsResponse.status, contactsResponse.statusText);
          throw new Error(`Failed to fetch contacts: ${contactsResponse.status}`);
        }
        const contactsData = await contactsResponse.json();
        setContacts(contactsData);
        
        // Fetch invoice with detailed error handling
        console.log(`Fetching invoice with ID: ${invoiceId}`);
        const invoiceResponse = await fetch(`/api/invoices/${invoiceId}`);
        
        if (!invoiceResponse.ok) {
          const errorText = await invoiceResponse.text();
          console.error('Failed to fetch invoice:', invoiceResponse.status, invoiceResponse.statusText, errorText);
          throw new Error(`Failed to fetch invoice: ${invoiceResponse.status} - ${errorText || invoiceResponse.statusText}`);
        }
        
        const invoiceData = await invoiceResponse.json();
        console.log('Fetched invoice data:', invoiceData);
        
        // Set invoice data
        setInvoice(invoiceData);
        setSelectedContact(invoiceData.contact_id || '');
        setInvoiceNumber(invoiceData.invoice_number || '');
        setStatus(invoiceData.status || 'draft');
        setNotes(invoiceData.notes || '');
        
        // Parse dates
        try {
          if (invoiceData.issue_date) {
            setIssueDate(new Date(invoiceData.issue_date));
          }
          if (invoiceData.due_date) {
            setDueDate(new Date(invoiceData.due_date));
          }
        } catch (error) {
          console.error('Error parsing dates:', error);
        }
        
        // Set items
        if (invoiceData.items && Array.isArray(invoiceData.items) && invoiceData.items.length > 0) {
          setItems(invoiceData.items.map((item: any) => ({
            id: item.id,
            invoice_id: item.invoice_id,
            description: item.description || '',
            quantity: Number(item.quantity) || 1,
            unit_price: Number(item.unit_price) || 0,
            amount: (Number(item.quantity) || 1) * (Number(item.unit_price) || 0)
          })));
        } else {
          // Default empty item
          setItems([{
            description: '',
            quantity: 1,
            unit_price: 0,
            amount: 0
          }]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load invoice data');
        toast.error('Failed to load invoice data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [invoiceId]);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        description: '',
        quantity: 1,
        unit_price: 0,
        amount: 0
      }
    ]);
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    setItems(items.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate amount when quantity or unit_price changes
        if (field === 'quantity' || field === 'unit_price') {
          updatedItem.amount = updatedItem.quantity * updatedItem.unit_price;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    if (!selectedContact) {
      toast.error('Please select a customer');
      return;
    }

    if (!invoiceNumber) {
      toast.error('Invoice number is required');
      return;
    }

    setSaving(true);

    try {
      // Prepare invoice data for update
      const invoiceData = {
        contact_id: selectedContact,
        invoice_number: invoiceNumber,
        issue_date: format(issueDate, 'yyyy-MM-dd'),
        due_date: format(dueDate, 'yyyy-MM-dd'),
        status: status,
        total_amount: total,
        notes: notes,
        items: items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          amount: item.quantity * item.unit_price
        }))
      };

      console.log('Sending update data:', JSON.stringify(invoiceData, null, 2));

      // Update the invoice
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to update invoice';
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
          console.error('Error data:', errorData);
        } catch (e) {
          // If the error response is not valid JSON, use the raw text
          errorMessage = errorText || errorMessage;
        }
        
        console.error('Error response status:', response.status);
        console.error('Error response text:', errorText);
        throw new Error(errorMessage);
      }

      const updatedInvoice = await response.json();
      console.log('Update successful, response:', updatedInvoice);
      
      toast.success('Invoice updated successfully');
      router.push('/invoices');
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update invoice');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Edit Invoice</h1>
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

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Edit Invoice</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-red-500">
            <p className="text-xl font-semibold">Error Loading Invoice</p>
            <p className="mt-2">{error}</p>
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
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit Invoice {invoiceNumber}</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => router.push('/invoices')}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : 'Update Invoice'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Customer Selection */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="customer" className="text-sm font-medium">
                  * Customer
                </Label>
                <Select value={selectedContact} onValueChange={setSelectedContact}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map(contact => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.first_name} {contact.last_name} {contact.company ? `(${contact.company})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status" className="text-sm font-medium">
                  Status
                </Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Details */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="invoiceNumber" className="text-sm font-medium">
                  * Invoice Number
                </Label>
                <Input
                  id="invoiceNumber"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="issueDate" className="text-sm font-medium">
                  * Issue Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full mt-1 justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {issueDate ? format(issueDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={issueDate}
                      onSelect={(date) => date && setIssueDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="dueDate" className="text-sm font-medium">
                  * Due Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full mt-1 justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={(date) => date && setDueDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Items */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 font-medium">Description</th>
                    <th className="text-right py-2 px-4 font-medium w-24">Quantity</th>
                    <th className="text-right py-2 px-4 font-medium w-32">Unit Price</th>
                    <th className="text-right py-2 px-4 font-medium w-32">Amount</th>
                    <th className="text-center py-2 px-4 font-medium w-16">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 px-4">
                        <Input
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          placeholder="Item description"
                        />
                      </td>
                      <td className="py-2 px-4">
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="text-right"
                          min="1"
                        />
                      </td>
                      <td className="py-2 px-4">
                        <Input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          className="text-right"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="py-2 px-4 text-right">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        }).format(item.amount || 0)}
                      </td>
                      <td className="py-2 px-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(index)}
                          disabled={items.length <= 1}
                          className="h-8 w-8 p-0 text-red-500"
                        >
                          &times;
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <Button variant="outline" onClick={handleAddItem} type="button">
                Add Item
              </Button>
            </div>
            <div className="mt-6 flex justify-end">
              <div className="w-64">
                <div className="flex justify-between py-2">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(total)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardContent className="pt-6">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1"
              rows={4}
              placeholder="Add any notes or additional information for this invoice"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 