import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TasksPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <Button>Create Task</Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Task Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            This is a placeholder for the tasks management page. In a complete implementation, this would display a list of tasks with search and filter functionality, and options to create, edit, and delete tasks.
          </p>
          
          <div className="border rounded-md p-4">
            <div className="text-center text-muted-foreground">
              No tasks found. Create your first task to get started.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 