import { NextResponse } from 'next/server';
import { getCurrentUser, checkUserAccess } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';

// GET /api/expenses/[id] - Get a specific expense
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
    
    // Check if user has access to this expense
    const { data: expense, error: accessError } = await supabaseAdmin
      .from('expenses')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', clerkId)
      .single();
    
    if (accessError || !expense) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    // Get related contact if available
    let contact = null;
    if (expense.customer_id) {
      const { data: contactData, error: contactError } = await supabaseAdmin
        .from('contacts')
        .select('id, first_name, last_name, email, company, phone')
        .eq('id', expense.customer_id)
        .single();
      
      if (!contactError && contactData) {
        contact = contactData;
      }
    }
    
    // Get related invoice if available
    let invoice = null;
    if (expense.invoice_id) {
      const { data: invoiceData, error: invoiceError } = await supabaseAdmin
        .from('invoices')
        .select('id, invoice_number, total_amount, status')
        .eq('id', expense.invoice_id)
        .single();
      
      if (!invoiceError && invoiceData) {
        invoice = invoiceData;
      }
    }
    
    return NextResponse.json({
      ...expense,
      contact,
      invoice
    });
  } catch (error) {
    console.error('Error in expense GET route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/expenses/[id] - Update an expense
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const clerkId = await getCurrentUser();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user has access to this expense
    const { data: existingExpense, error: accessError } = await supabaseAdmin
      .from('expenses')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', clerkId)
      .single();
    
    if (accessError || !existingExpense) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    const body = await req.json();
    
    // Validate required fields
    if (!body.category || !body.amount || !body.name || !body.date) {
      return NextResponse.json({ 
        error: 'Category, amount, name, and date are required' 
      }, { status: 400 });
    }
    
    // Update expense
    const { data: expense, error } = await supabaseAdmin
      .from('expenses')
      .update({
        category: body.category,
        amount: body.amount,
        name: body.name,
        receipt_url: body.receipt_url || null,
        date: body.date,
        project: body.project || null,
        customer_id: body.customer_id || null,
        invoice_id: body.invoice_id || null,
        reference: body.reference || null,
        payment_mode: body.payment_mode || null,
        notes: body.notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating expense:', error);
      return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 });
    }
    
    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error in expense PUT route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/expenses/[id] - Delete an expense
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const clerkId = await getCurrentUser();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user has access to this expense
    const { data: existingExpense, error: accessError } = await supabaseAdmin
      .from('expenses')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', clerkId)
      .single();
    
    if (accessError || !existingExpense) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    // Delete expense
    const { error } = await supabaseAdmin
      .from('expenses')
      .delete()
      .eq('id', params.id);
    
    if (error) {
      console.error('Error deleting expense:', error);
      return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error in expense DELETE route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 