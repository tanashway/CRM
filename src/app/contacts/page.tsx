import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ContactsPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Contacts</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Contact Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This is a placeholder for the contacts management page. In a complete implementation, this would display a list of contacts with search and filter functionality, and options to add, edit, and delete contacts.
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 