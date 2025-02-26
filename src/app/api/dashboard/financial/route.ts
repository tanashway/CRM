import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getCurrentUserData } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';

// GET /api/dashboard/financial - Get financial data for charts
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
    const period = url.searchParams.get('period') || 'month';
    
    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
    }
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = now.toISOString().split('T')[0];
    
    // Get revenue data (paid invoices)
    const { data: revenueData, error: revenueError } = await supabaseAdmin
      .from('invoices')
      .select('issue_date, total_amount')
      .eq('user_id', userData.id)
      .eq('status', 'paid')
      .gte('issue_date', startDateStr)
      .lte('issue_date', endDateStr)
      .order('issue_date', { ascending: true });
    
    if (revenueError) {
      console.error('Error fetching revenue data:', revenueError);
      return NextResponse.json({ error: 'Failed to fetch financial data' }, { status: 500 });
    }
    
    // Get expense data (transactions with type 'expense')
    const { data: expenseData, error: expenseError } = await supabaseAdmin
      .from('transactions')
      .select('date, amount')
      .eq('user_id', userData.id)
      .eq('type', 'expense')
      .gte('date', startDateStr)
      .lte('date', endDateStr)
      .order('date', { ascending: true });
    
    if (expenseError) {
      console.error('Error fetching expense data:', expenseError);
      return NextResponse.json({ error: 'Failed to fetch financial data' }, { status: 500 });
    }
    
    // Group data by date for chart
    const revenueByDate = groupFinancialDataByDate(revenueData, 'issue_date', 'total_amount');
    const expensesByDate = groupFinancialDataByDate(expenseData, 'date', 'amount');
    
    // Get all dates in range
    const dateRange = getDateRange(startDate, now);
    
    // Format data for chart
    const chartData = dateRange.map(date => {
      const dateStr = date.toISOString().split('T')[0];
      return {
        date: dateStr,
        revenue: revenueByDate[dateStr] || 0,
        expenses: expensesByDate[dateStr] || 0,
      };
    });
    
    // Calculate totals
    const totalRevenue = revenueData.reduce((sum, item) => sum + (item.total_amount || 0), 0);
    const totalExpenses = expenseData.reduce((sum, item) => sum + (item.amount || 0), 0);
    const netProfit = totalRevenue - totalExpenses;
    
    // Get top revenue sources (by contact)
    const { data: topSources, error: sourcesError } = await supabaseAdmin
      .from('invoices')
      .select(`
        contact_id,
        contacts (
          id,
          first_name,
          last_name,
          company
        ),
        total_amount
      `)
      .eq('user_id', userData.id)
      .eq('status', 'paid')
      .gte('issue_date', startDateStr)
      .lte('issue_date', endDateStr);
    
    if (sourcesError) {
      console.error('Error fetching revenue sources:', sourcesError);
      return NextResponse.json({ error: 'Failed to fetch financial data' }, { status: 500 });
    }
    
    // Group by contact and sum amounts
    const sourcesByContact: Record<string, { contact: any; total: number }> = {};
    
    topSources.forEach(invoice => {
      const contactId = invoice.contact_id;
      if (!sourcesByContact[contactId]) {
        sourcesByContact[contactId] = {
          contact: invoice.contacts,
          total: 0,
        };
      }
      sourcesByContact[contactId].total += (invoice.total_amount || 0);
    });
    
    // Convert to array and sort by total
    const revenueSources = Object.values(sourcesByContact)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map(item => ({
        id: item.contact.id,
        name: item.contact.company || `${item.contact.first_name} ${item.contact.last_name}`,
        amount: item.total,
        percentage: totalRevenue > 0 ? (item.total / totalRevenue) * 100 : 0,
      }));
    
    return NextResponse.json({
      chart_data: chartData,
      summary: {
        total_revenue: totalRevenue,
        total_expenses: totalExpenses,
        net_profit: netProfit,
        profit_margin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
      },
      revenue_sources: revenueSources,
    });
  } catch (error) {
    console.error('Error in financial data GET route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to group financial data by date
function groupFinancialDataByDate(
  data: any[],
  dateField: string,
  amountField: string
): Record<string, number> {
  const result: Record<string, number> = {};
  
  data.forEach(item => {
    const date = item[dateField];
    const amount = item[amountField] || 0;
    
    if (!result[date]) {
      result[date] = 0;
    }
    
    result[date] += amount;
  });
  
  return result;
}

// Helper function to get array of dates in range
function getDateRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
} 