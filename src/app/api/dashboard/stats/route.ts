import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getCurrentUserData } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET(req: NextRequest) {
  try {
    const clerkId = getCurrentUser();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userData = await getCurrentUserData();
    
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get total contacts count
    const { count: contactsCount, error: contactsError } = await supabaseAdmin
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userData.id);
    
    if (contactsError) {
      console.error('Error fetching contacts count:', contactsError);
      return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
    }
    
    // Get active invoices count
    const { count: activeInvoicesCount, error: invoicesError } = await supabaseAdmin
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userData.id)
      .in('status', ['draft', 'sent', 'overdue']);
    
    if (invoicesError) {
      console.error('Error fetching invoices count:', invoicesError);
      return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
    }
    
    // Get pending tasks count
    const { count: pendingTasksCount, error: tasksError } = await supabaseAdmin
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userData.id)
      .in('status', ['pending', 'in_progress']);
    
    if (tasksError) {
      console.error('Error fetching tasks count:', tasksError);
      return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
    }
    
    // Get total revenue (sum of paid invoices)
    const { data: revenueData, error: revenueError } = await supabaseAdmin
      .from('invoices')
      .select('total_amount')
      .eq('user_id', userData.id)
      .eq('status', 'paid');
    
    if (revenueError) {
      console.error('Error fetching revenue:', revenueError);
      return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
    }
    
    const totalRevenue = revenueData.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);
    
    // Get recent activity (combined from contacts, invoices, and tasks)
    const { data: recentContacts, error: recentContactsError } = await supabaseAdmin
      .from('contacts')
      .select('id, first_name, last_name, created_at')
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (recentContactsError) {
      console.error('Error fetching recent contacts:', recentContactsError);
      return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
    }
    
    const { data: recentInvoices, error: recentInvoicesError } = await supabaseAdmin
      .from('invoices')
      .select('id, invoice_number, status, created_at')
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (recentInvoicesError) {
      console.error('Error fetching recent invoices:', recentInvoicesError);
      return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
    }
    
    const { data: recentTasks, error: recentTasksError } = await supabaseAdmin
      .from('tasks')
      .select('id, title, status, created_at')
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (recentTasksError) {
      console.error('Error fetching recent tasks:', recentTasksError);
      return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
    }
    
    // Combine and sort recent activity
    const recentActivity = [
      ...recentContacts.map(contact => ({
        type: 'contact',
        id: contact.id,
        title: `${contact.first_name} ${contact.last_name}`,
        created_at: contact.created_at,
      })),
      ...recentInvoices.map(invoice => ({
        type: 'invoice',
        id: invoice.id,
        title: `Invoice #${invoice.invoice_number}`,
        status: invoice.status,
        created_at: invoice.created_at,
      })),
      ...recentTasks.map(task => ({
        type: 'task',
        id: task.id,
        title: task.title,
        status: task.status,
        created_at: task.created_at,
      })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);
    
    // Return all statistics
    return NextResponse.json({
      contacts_count: contactsCount || 0,
      active_invoices_count: activeInvoicesCount || 0,
      pending_tasks_count: pendingTasksCount || 0,
      total_revenue: totalRevenue,
      recent_activity: recentActivity,
    });
  } catch (error) {
    console.error('Error in dashboard stats GET route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 