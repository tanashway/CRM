import { NextResponse } from 'next/server';
import { getCurrentUser, checkUserAccess } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const clerkId = await getCurrentUser();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user has access to this invoice
    const hasAccess = await checkUserAccess('invoices', params.id);
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    // Get invoice data
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('id', params.id)
      .single();
    
    if (invoiceError || !invoice) {
      console.error('Error fetching invoice for PDF:', invoiceError);
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    
    // Get invoice items
    const { data: items, error: itemsError } = await supabaseAdmin
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', params.id)
      .order('created_at', { ascending: true });
    
    if (itemsError) {
      console.error('Error fetching invoice items for PDF:', itemsError);
      return NextResponse.json({ error: 'Failed to fetch invoice items' }, { status: 500 });
    }
    
    // Try to get contact information
    let contact = null;
    if (invoice.contact_id) {
      const { data: contactData, error: contactError } = await supabaseAdmin
        .from('contacts')
        .select('*')
        .eq('id', invoice.contact_id)
        .single();
      
      if (!contactError && contactData) {
        contact = contactData;
      } else {
        console.warn('Could not fetch contact for PDF:', contactError);
      }
    }
    
    // Generate PDF
    const doc = new jsPDF();
    
    // Add company info
    doc.setFontSize(20);
    doc.text('INVOICE', 14, 22);
    
    doc.setFontSize(10);
    doc.text('Your Company Name', 14, 30);
    doc.text('123 Business Street', 14, 35);
    doc.text('City, State ZIP', 14, 40);
    doc.text('Email: contact@yourcompany.com', 14, 45);
    
    // Add invoice details
    doc.setFontSize(12);
    doc.text(`Invoice #: ${invoice.invoice_number}`, 140, 30);
    doc.text(`Issue Date: ${new Date(invoice.issue_date).toLocaleDateString()}`, 140, 35);
    doc.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, 140, 40);
    doc.text(`Status: ${invoice.status.toUpperCase()}`, 140, 45);
    
    // Add client info if available
    if (contact) {
      doc.setFontSize(12);
      doc.text('Bill To:', 14, 60);
      doc.setFontSize(10);
      
      const clientName = contact.company 
        ? `${contact.company}` 
        : `${contact.first_name} ${contact.last_name}`;
      
      doc.text(clientName, 14, 65);
      
      if (contact.email) {
        doc.text(`Email: ${contact.email}`, 14, 70);
      }
      
      if (contact.phone) {
        doc.text(`Phone: ${contact.phone}`, 14, 75);
      }
    }
    
    // Add invoice items table
    const tableColumn = ["Description", "Quantity", "Unit Price", "Amount"];
    const tableRows = items?.map(item => [
      item.description,
      item.quantity.toString(),
      formatCurrency(item.unit_price),
      formatCurrency(item.quantity * item.unit_price)
    ]) || [];
    
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 85,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    // Add total
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.text(`Total Amount: ${formatCurrency(invoice.total_amount)}`, 140, finalY);
    
    // Add notes if available
    if (invoice.notes) {
      doc.setFontSize(10);
      doc.text('Notes:', 14, finalY + 10);
      doc.setFontSize(9);
      
      // Split notes into lines to avoid text going off the page
      const splitNotes = doc.splitTextToSize(invoice.notes, 180);
      doc.text(splitNotes, 14, finalY + 15);
    }
    
    // Convert PDF to buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    
    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoice_number}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
} 