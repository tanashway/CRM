import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function InvoicesPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <Button>Create Invoice</Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Invoice Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            This is a placeholder for the invoices management page. In a complete implementation, this would display a list of invoices with search and filter functionality, and options to create, edit, and delete invoices.
          </p>
          
          <div className="border rounded-md p-4">
            <div className="text-center text-muted-foreground">
              No invoices found. Create your first invoice to get started.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 