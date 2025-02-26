import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  CalendarDays, 
  Clock, 
  DollarSign, 
  FileText, 
  Plus, 
  Users 
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dashboard | Personal CRM',
  description: 'Overview of your CRM data and activities',
};

// Placeholder for dashboard stats component
function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Contacts
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="text-2xl font-bold">24</div>
          <p className="text-xs text-muted-foreground">+2 this week</p>
        </CardContent>
        <CardFooter>
          <Link href="/contacts" className="text-xs text-blue-600 hover:underline flex items-center">
            <Users className="h-3 w-3 mr-1" />
            View all contacts
          </Link>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Active Invoices
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="text-2xl font-bold">5</div>
          <p className="text-xs text-muted-foreground">$1,240.00 outstanding</p>
        </CardContent>
        <CardFooter>
          <Link href="/invoices" className="text-xs text-blue-600 hover:underline flex items-center">
            <FileText className="h-3 w-3 mr-1" />
            View all invoices
          </Link>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Pending Tasks
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="text-2xl font-bold">7</div>
          <p className="text-xs text-muted-foreground">3 due today</p>
        </CardContent>
        <CardFooter>
          <Link href="/tasks" className="text-xs text-blue-600 hover:underline flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            View all tasks
          </Link>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Revenue
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="text-2xl font-bold">$4,890.00</div>
          <p className="text-xs text-muted-foreground">+$750.00 this month</p>
        </CardContent>
        <CardFooter>
          <Link href="/invoices?status=paid" className="text-xs text-blue-600 hover:underline flex items-center">
            <DollarSign className="h-3 w-3 mr-1" />
            View revenue details
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

// Placeholder for recent activity component
function RecentActivity() {
  const activities = [
    { id: 1, type: 'contact', title: 'New contact added', name: 'John Smith', time: '2 hours ago' },
    { id: 2, type: 'invoice', title: 'Invoice paid', name: 'INV-001', amount: '$450.00', time: '5 hours ago' },
    { id: 3, type: 'task', title: 'Task completed', name: 'Call with Jane Doe', time: 'Yesterday' },
    { id: 4, type: 'contact', title: 'Contact updated', name: 'Sarah Johnson', time: 'Yesterday' },
    { id: 5, type: 'invoice', title: 'Invoice sent', name: 'INV-002', amount: '$890.00', time: '2 days ago' },
  ];

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest CRM activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4 border-b pb-4 last:border-0">
              <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                {activity.type === 'contact' && <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                {activity.type === 'invoice' && <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                {activity.type === 'task' && <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">{activity.title}</p>
                <p className="text-sm text-muted-foreground">{activity.name} {activity.amount && `- ${activity.amount}`}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full">View All Activity</Button>
      </CardFooter>
    </Card>
  );
}

// Placeholder for upcoming tasks component
function UpcomingTasks() {
  const tasks = [
    { id: 1, title: 'Call with Jane Doe', date: 'Today, 2:00 PM', priority: 'high' },
    { id: 2, title: 'Send proposal to ABC Corp', date: 'Today, 5:00 PM', priority: 'medium' },
    { id: 3, title: 'Follow up with new leads', date: 'Tomorrow, 10:00 AM', priority: 'medium' },
    { id: 4, title: 'Review quarterly goals', date: 'Feb 28, 2023', priority: 'low' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Tasks</CardTitle>
        <CardDescription>Tasks due soon</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-start space-x-4 border-b pb-4 last:border-0">
              <div className={`rounded-full h-2 w-2 mt-2 ${
                task.priority === 'high' ? 'bg-red-500' : 
                task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
              }`} />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">{task.title}</p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <CalendarDays className="h-3 w-3 mr-1" />
                  {task.date}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm">View All Tasks</Button>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Task
        </Button>
      </CardFooter>
    </Card>
  );
}

// Placeholder for financial overview component
function FinancialOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Overview</CardTitle>
        <CardDescription>Revenue vs. Expenses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] flex items-center justify-center">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <BarChart className="h-8 w-8" />
            <span>Chart data will load here</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total Revenue</p>
            <p className="text-sm font-medium">$4,890.00</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total Expenses</p>
            <p className="text-sm font-medium">$2,140.00</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Net Profit</p>
            <p className="text-sm font-medium">$2,750.00</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Profit Margin</p>
            <p className="text-sm font-medium">56.2%</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full">View Detailed Report</Button>
      </CardFooter>
    </Card>
  );
}

// Placeholder for quick actions component
function QuickActions() {
  const actions = [
    { title: 'Add Contact', icon: <Users className="h-4 w-4" />, href: '/contacts/new' },
    { title: 'Create Invoice', icon: <FileText className="h-4 w-4" />, href: '/invoices/new' },
    { title: 'Add Task', icon: <Clock className="h-4 w-4" />, href: '/tasks/new' },
    { title: 'Ask AI', icon: <BarChart className="h-4 w-4" />, href: '/ai' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Button variant="outline" className="w-full justify-start">
                <div className="mr-2">{action.icon}</div>
                {action.title}
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Clock className="h-4 w-4 mr-2" />
            Last updated: Just now
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </div>
      </div>
      
      <Suspense fallback={<div>Loading stats...</div>}>
        <DashboardStats />
      </Suspense>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Suspense fallback={<div>Loading activity...</div>}>
          <RecentActivity />
        </Suspense>
        
        <div className="space-y-6">
          <Suspense fallback={<div>Loading tasks...</div>}>
            <UpcomingTasks />
          </Suspense>
          
          <Suspense fallback={<div>Loading actions...</div>}>
            <QuickActions />
          </Suspense>
        </div>
      </div>
      
      <Suspense fallback={<div>Loading financial data...</div>}>
        <FinancialOverview />
      </Suspense>
    </div>
  );
} 