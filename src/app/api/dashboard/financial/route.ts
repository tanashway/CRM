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
    const startDate = url.searchParams.get('start_date') 
      ? new Date(url.searchParams.get('start_date')!) 
      : new Date(new Date().setDate(new Date().getDate() - 30));
    const endDate = url.searchParams.get('end_date')
      ? new Date(url.searchParams.get('end_date')!)
      : new Date();
    
    // Get invoices for the period
    const { data: invoices, error: invoicesError } = await supabaseAdmin
      .from('invoices')
      .select('id, total_amount, status, issue_date, due_date, created_at')
      .eq('user_id', userData.id)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());
    
    if (invoicesError) {
      console.error('Error fetching invoices:', invoicesError);
      return NextResponse.json({ error: 'Failed to fetch financial data' }, { status: 500 });
    }
    
    // Calculate revenue by status
    const totalRevenue = invoices
      .filter(invoice => invoice.status === 'paid')
      .reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);
    
    const pendingRevenue = invoices
      .filter(invoice => ['sent', 'draft'].includes(invoice.status))
      .reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);
    
    const overdueRevenue = invoices
      .filter(invoice => invoice.status === 'overdue')
      .reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);
    
    // Group data by date
    const revenueByDate = groupFinancialDataByDate(
      invoices.filter(invoice => invoice.status === 'paid'),
      'created_at',
      'total_amount'
    );
    
    const pendingByDate = groupFinancialDataByDate(
      invoices.filter(invoice => ['sent', 'draft'].includes(invoice.status)),
      'created_at',
      'total_amount'
    );
    
    const overdueByDate = groupFinancialDataByDate(
      invoices.filter(invoice => invoice.status === 'overdue'),
      'created_at',
      'total_amount'
    );
    
    // Get all dates in the range
    const dateRange = getDateRange(startDate, endDate);
    
    // Format data for charts
    const chartData = dateRange.map(date => {
      const dateStr = date.toISOString().split('T')[0];
      return {
        date: dateStr,
        revenue: revenueByDate[dateStr] || 0,
        pending: pendingByDate[dateStr] || 0,
        overdue: overdueByDate[dateStr] || 0,
      };
    });
    
    // Get monthly revenue for the last 12 months
    const today = new Date();
    const twelveMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 11, 1);
    
    const { data: monthlyInvoices, error: monthlyError } = await supabaseAdmin
      .from('invoices')
      .select('total_amount, status, created_at')
      .eq('user_id', userData.id)
      .eq('status', 'paid')
      .gte('created_at', twelveMonthsAgo.toISOString());
    
    if (monthlyError) {
      console.error('Error fetching monthly invoices:', monthlyError);
      return NextResponse.json({ error: 'Failed to fetch financial data' }, { status: 500 });
    }
    
    // Group by month
    const monthlyRevenueData: Record<string, number> = {};
    
    monthlyInvoices.forEach(invoice => {
      const date = new Date(invoice.created_at);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyRevenueData[monthYear]) {
        monthlyRevenueData[monthYear] = 0;
      }
      
      monthlyRevenueData[monthYear] += invoice.total_amount || 0;
    });
    
    // Format monthly data
    const monthlyRevenue = Object.keys(monthlyRevenueData)
      .sort()
      .map(monthYear => ({
        month: monthYear,
        revenue: monthlyRevenueData[monthYear],
      }));
    
    return NextResponse.json({
      total_revenue: totalRevenue,
      pending_revenue: pendingRevenue,
      overdue_revenue: overdueRevenue,
      chart_data: chartData,
      monthly_revenue: monthlyRevenue,
    });
  } catch (error) {
    console.error('Error in financial GET route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to group financial data by date
function groupFinancialDataByDate(
  data: Array<{ [key: string]: unknown }>,
  dateField: string,
  amountField: string
): Record<string, number> {
  const result: Record<string, number> = {};
  
  data.forEach(item => {
    const date = new Date(item[dateField] as string);
    const dateStr = date.toISOString().split('T')[0];
    
    if (!result[dateStr]) {
      result[dateStr] = 0;
    }
    
    result[dateStr] += (item[amountField] as number) || 0;
  });
  
  return result;
}

// Helper function to get all dates in a range
function getDateRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

// Define proper types for the monthly revenue data
export interface MonthlyRevenueData {
  month: string;
  revenue: number;
} 