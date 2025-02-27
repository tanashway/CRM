'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  company: string | null;
  email: string;
}

interface InvoiceItem {
  id: string;
  description: string;
  longDescription?: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  amount: number;
}

export default function CreateInvoicePage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [issueDate, setIssueDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: '1',
      description: '',
      longDescription: '',
      quantity: 1,
      unitPrice: 0,
      tax: 0,
      amount: 0
    }
  ]);
  const [notes, setNotes] = useState('');
  const [termsAndConditions, setTermsAndConditions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [currency, setCurrency] = useState('USD');
  const [recurringInvoice, setRecurringInvoice] = useState('no');
  const [saleAgent, setSaleAgent] = useState('');
  const [discountType, setDiscountType] = useState('no-discount');
  const [discountValue, setDiscountValue] = useState(0);
  const [adjustment, setAdjustment] = useState(0);

  // Calculate subtotal, discount, and total
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const discountAmount = discountType === 'percentage' 
    ? subtotal * (discountValue / 100) 
    : (discountType === 'fixed' ? discountValue : 0);
  const total = subtotal - discountAmount + adjustment;

  useEffect(() => {
    // Fetch contacts
    const fetchContacts = async () => {
      try {
        const response = await fetch('/api/contacts');
        if (!response.ok) throw new Error('Failed to fetch contacts');
        const data = await response.json();
        setContacts(data);
      } catch (error) {
        console.error('Error fetching contacts:', error);
        toast.error('Failed to load contacts');
      }
    };

    fetchContacts();

    // Generate invoice number (could be more sophisticated)
    setInvoiceNumber(`INV-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`);
  }, []);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: (items.length + 1).toString(),
        description: '',
        longDescription: '',
        quantity: 1,
        unitPrice: 0,
        tax: 0,
        amount: 0
      }
    ]);
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate amount when quantity or unitPrice changes
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.amount = updatedItem.quantity * updatedItem.unitPrice;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
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

    setLoading(true);

    try {
      // Simplify the invoice data to match exactly what the API expects
      const invoiceData = {
        contact_id: selectedContact,
        invoice_number: invoiceNumber,
        issue_date: format(issueDate, 'yyyy-MM-dd'),
        due_date: format(dueDate, 'yyyy-MM-dd'),
        status: 'draft',
        total_amount: total,
        notes: notes,
        // Only include fields that are explicitly handled in the API
        items: items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          // Calculate amount correctly
          amount: item.quantity * item.unitPrice
        }))
      };

      console.log('Sending invoice data:', invoiceData);

      // First try to create the invoice without items
      const basicInvoiceData = {
        contact_id: invoiceData.contact_id,
        invoice_number: invoiceData.invoice_number,
        issue_date: invoiceData.issue_date,
        due_date: invoiceData.due_date,
        status: invoiceData.status,
        total_amount: invoiceData.total_amount,
        notes: invoiceData.notes
      };

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(basicInvoiceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create invoice');
      }

      const result = await response.json();
      toast.success('Invoice created successfully');
      
      // Try to navigate to the invoice list
      try {
        router.push('/invoices');
      } catch (navError) {
        console.error('Navigation error:', navError);
        // If navigation fails, reload the page
        window.location.href = '/invoices';
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create New Invoice</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => router.push('/invoices')}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Save Invoice'}
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
                    <SelectValue placeholder="Select and begin typing..." />
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
                <Label htmlFor="type" className="text-sm font-medium">
                  Type
                </Label>
                <Select defaultValue="invoice">
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="invoice">Invoice</SelectItem>
                    <SelectItem value="estimate">Estimate</SelectItem>
                    <SelectItem value="quote">Quote</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Bill To</h3>
                {selectedContact && contacts.find(c => c.id === selectedContact) ? (
                  <div className="text-sm text-gray-600">
                    <p>{contacts.find(c => c.id === selectedContact)?.first_name} {contacts.find(c => c.id === selectedContact)?.last_name}</p>
                    <p>{contacts.find(c => c.id === selectedContact)?.company}</p>
                    <p>{contacts.find(c => c.id === selectedContact)?.email}</p>
                  </div>
                ) : (
                  <div className="text-sm text-gray-400">No customer selected</div>
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Ship To</h3>
                <div className="text-sm text-gray-400">Same as billing address</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Details */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  * Invoice Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full mt-1 justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {issueDate ? format(issueDate, 'PP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={issueDate}
                      onSelect={(date: Date | undefined) => date && setIssueDate(date)}
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
                      {dueDate ? format(dueDate, 'PP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={(date: Date | undefined) => date && setDueDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="mt-6">
              <Label className="text-sm font-medium">Allowed payment modes for this invoice</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank / Stripe Checkout</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="credit">Credit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div>
                <Label htmlFor="currency" className="text-sm font-medium">
                  * Currency
                </Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD $</SelectItem>
                    <SelectItem value="EUR">EUR €</SelectItem>
                    <SelectItem value="GBP">GBP £</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="recurring" className="text-sm font-medium">
                  Recurring Invoice?
                </Label>
                <Select value={recurringInvoice} onValueChange={setRecurringInvoice}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="biannually">Bi-annually</SelectItem>
                    <SelectItem value="annually">Annually</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="saleAgent" className="text-sm font-medium">
                  Sale Agent
                </Label>
                <Input
                  id="saleAgent"
                  value={saleAgent}
                  onChange={(e) => setSaleAgent(e.target.value)}
                  className="mt-1"
                  placeholder="Sale agent name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <Label htmlFor="discountType" className="text-sm font-medium">
                  Discount Type
                </Label>
                <Select value={discountType} onValueChange={setDiscountType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select discount type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-discount">No discount</SelectItem>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {discountType !== 'no-discount' && (
                <div>
                  <Label htmlFor="discountValue" className="text-sm font-medium">
                    Discount Value
                  </Label>
                  <Input
                    id="discountValue"
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Invoice Items */}
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium text-sm">Item</th>
                    <th className="text-left py-2 font-medium text-sm">Description</th>
                    <th className="text-right py-2 font-medium text-sm">Qty</th>
                    <th className="text-right py-2 font-medium text-sm">Rate</th>
                    <th className="text-right py-2 font-medium text-sm">Tax</th>
                    <th className="text-right py-2 font-medium text-sm">Amount</th>
                    <th className="text-right py-2 font-medium text-sm"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-2">
                        <Input
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                          placeholder="Item name"
                        />
                      </td>
                      <td className="py-2">
                        <Textarea
                          value={item.longDescription || ''}
                          onChange={(e) => handleItemChange(item.id, 'longDescription', e.target.value)}
                          placeholder="Long description"
                          className="h-10 min-h-0"
                        />
                      </td>
                      <td className="py-2">
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                          className="text-right"
                          min="1"
                        />
                      </td>
                      <td className="py-2">
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(item.id, 'unitPrice', Number(e.target.value))}
                          className="text-right"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="py-2">
                        <Select
                          value={item.tax.toString()}
                          onValueChange={(value) => handleItemChange(item.id, 'tax', Number(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="No Tax" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">No Tax</SelectItem>
                            <SelectItem value="5">5%</SelectItem>
                            <SelectItem value="10">10%</SelectItem>
                            <SelectItem value="15">15%</SelectItem>
                            <SelectItem value="20">20%</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-2 text-right">
                        {(item.quantity * item.unitPrice).toFixed(2)}
                      </td>
                      <td className="py-2 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={items.length === 1}
                        >
                          ×
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4">
              <Button variant="outline" onClick={handleAddItem}>
                Add Item
              </Button>
            </div>

            <div className="flex justify-end mt-6">
              <div className="w-full max-w-xs">
                <div className="flex justify-between py-2">
                  <span>Sub Total:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discountType !== 'no-discount' && (
                  <div className="flex justify-between py-2">
                    <span>Discount ({discountType === 'percentage' ? `${discountValue}%` : 'Fixed'}):</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between py-2">
                  <span>Adjustment:</span>
                  <div className="flex items-center">
                    <span className="mr-2">$</span>
                    <Input
                      type="number"
                      value={adjustment}
                      onChange={(e) => setAdjustment(Number(e.target.value))}
                      className="w-20 text-right"
                    />
                  </div>
                </div>
                <div className="flex justify-between py-2 font-bold border-t">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes and Terms */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="notes" className="text-sm font-medium">
                  Admin Note
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 h-32"
                  placeholder="Notes visible to admin only"
                />
              </div>
              <div>
                <Label htmlFor="termsAndConditions" className="text-sm font-medium">
                  Terms & Conditions
                </Label>
                <Textarea
                  id="termsAndConditions"
                  value={termsAndConditions}
                  onChange={(e) => setTermsAndConditions(e.target.value)}
                  className="mt-1 h-32"
                  placeholder="Terms and conditions for the invoice"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => router.push('/invoices')}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Save Invoice'}
          </Button>
        </div>
      </div>
    </div>
  );
} 