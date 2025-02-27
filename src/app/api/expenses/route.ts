import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';

// GET /api/expenses - Get all expenses for the current user
export async function GET(req: Request) {
  try {
    const clerkId = await getCurrentUser();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse query parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '25');
    const sortBy = url.searchParams.get('sortBy') || 'date';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';
    const category = url.searchParams.get('category');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const search = url.searchParams.get('search');
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Start building the query
    let query = supabaseAdmin
      .from('expenses')
      .select(`
        *,
        contacts:customer_id (id, first_name, last_name, company),
        invoices:invoice_id (id, invoice_number)
      `)
      .eq('user_id', clerkId)
      .order(sortBy, { ascending: sortOrder === 'asc' });
    
    // Apply filters if provided
    if (category) {
      query = query.eq('category', category);
    }
    
    if (startDate) {
      query = query.gte('date', startDate);
    }
    
    if (endDate) {
      query = query.lte('date', endDate);
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%, reference.ilike.%${search}%, project.ilike.%${search}%`);
    }
    
    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabaseAdmin
      .from('expenses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', clerkId);
    
    if (countError) {
      console.error('Error counting expenses:', countError);
      return NextResponse.json({ error: 'Failed to count expenses' }, { status: 500 });
    }
    
    // Execute the query with pagination
    const { data: expenses, error } = await query
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Error fetching expenses:', error);
      return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
    }
    
    return NextResponse.json({
      expenses: expenses || [],
      pagination: {
        total: totalCount || 0,
        page,
        limit,
        totalPages: Math.ceil((totalCount || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error in expenses GET route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/expenses - Create a new expense
export async function POST(req: Request) {
  try {
    const clerkId = await getCurrentUser();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    
    // Validate required fields
    if (!body.category || !body.amount || !body.name || !body.date) {
      return NextResponse.json({ 
        error: 'Category, amount, name, and date are required' 
      }, { status: 400 });
    }
    
    // Create expense
    const { data: expense, error } = await supabaseAdmin
      .from('expenses')
      .insert({
        user_id: clerkId,
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating expense:', error);
      return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
    }
    
    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error in expenses POST route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 