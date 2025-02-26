import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getCurrentUserData } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';

// GET /api/tasks - Get all tasks for the current user
export async function GET(req: NextRequest) {
  try {
    const clerkId = await getCurrentUser();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userData = await getCurrentUserData();
    
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get query parameters
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const priority = url.searchParams.get('priority');
    const contactId = url.searchParams.get('contact_id');
    
    // Build query
    let query = supabaseAdmin
      .from('tasks')
      .select(`
        *,
        contacts (
          id,
          first_name,
          last_name,
          email,
          company
        )
      `)
      .eq('user_id', userData.id)
      .order('due_date', { ascending: true });
    
    // Add filters if provided
    if (status) {
      query = query.eq('status', status);
    }
    
    if (priority) {
      query = query.eq('priority', priority);
    }
    
    if (contactId) {
      query = query.eq('contact_id', contactId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching tasks:', error);
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in tasks GET route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/tasks - Create a new task
export async function POST(req: NextRequest) {
  try {
    const clerkId = await getCurrentUser();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userData = await getCurrentUserData();
    
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const body = await req.json();
    
    // Validate required fields
    if (!body.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    // Validate contact if provided
    if (body.contact_id) {
      const { count, error: contactError } = await supabaseAdmin
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('id', body.contact_id)
        .eq('user_id', userData.id);
      
      if (contactError || count === 0) {
        return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
      }
    }
    
    // Create task
    const { data, error } = await supabaseAdmin
      .from('tasks')
      .insert({
        user_id: userData.id,
        contact_id: body.contact_id || null,
        title: body.title,
        description: body.description || '',
        due_date: body.due_date || null,
        status: body.status || 'pending',
        priority: body.priority || 'medium',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating task:', error);
      return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in tasks POST route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 