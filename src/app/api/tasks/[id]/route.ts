import { NextResponse } from 'next/server';
import { getCurrentUser, checkUserAccess } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';

// Force a fresh build on Vercel
// GET /api/tasks/[id] - Get a specific task
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
    
    const hasAccess = await checkUserAccess('tasks', params.id);
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    const { data, error } = await supabaseAdmin
      .from('tasks')
      .select(`
        *,
        contacts (
          id,
          first_name,
          last_name,
          email,
          phone,
          company
        )
      `)
      .eq('id', params.id)
      .single();
    
    if (error) {
      console.error('Error fetching task:', error);
      return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in tasks GET route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/tasks/[id] - Update a specific task
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
    
    const hasAccess = await checkUserAccess('tasks', params.id);
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    const body = await req.json();
    
    // Validate required fields
    if (!body.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    // Validate contact if provided
    if (body.contact_id) {
      const { data: userData, error: userError } = await supabaseAdmin
        .from('tasks')
        .select('user_id')
        .eq('id', params.id)
        .single();
      
      if (userError || !userData) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }
      
      const { count, error: contactError } = await supabaseAdmin
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('id', body.contact_id)
        .eq('user_id', userData.user_id);
      
      if (contactError || count === 0) {
        return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
      }
    }
    
    // Update task
    const { data, error } = await supabaseAdmin
      .from('tasks')
      .update({
        contact_id: body.contact_id || null,
        title: body.title,
        description: body.description || '',
        due_date: body.due_date || null,
        status: body.status || 'pending',
        priority: body.priority || 'medium',
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating task:', error);
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in tasks PUT route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/tasks/[id] - Delete a specific task
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
    
    const hasAccess = await checkUserAccess('tasks', params.id);
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    const { error } = await supabaseAdmin
      .from('tasks')
      .delete()
      .eq('id', params.id);
    
    if (error) {
      console.error('Error deleting task:', error);
      return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in tasks DELETE route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 