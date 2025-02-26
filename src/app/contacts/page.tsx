"use client";

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  MoreHorizontal, 
  Plus, 
  Upload, 
  Loader2
} from 'lucide-react';
import { Contact, getContacts, updateContact, deleteContact } from '@/lib/contacts-service';
import { useRouter } from 'next/navigation';
import { useToast } from "@/components/ui/use-toast";

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [excludeInactive, setExcludeInactive] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Stats
  const totalContacts = contacts.length;
  const activeContacts = contacts.filter(c => c.status === 'active').length;
  const inactiveContacts = totalContacts - activeContacts;
  const contactsWithCompany = contacts.filter(c => c.company && c.company.trim() !== '').length;
  const contactsWithoutCompany = totalContacts - contactsWithCompany;
  const contactsLoggedToday = 0; // This would be calculated based on actual data
  
  // Fetch contacts
  useEffect(() => {
    async function fetchContacts() {
      try {
        setLoading(true);
        const params: { status?: string; search?: string } = {};
        
        if (excludeInactive) {
          params.status = 'active';
        }
        
        if (searchQuery) {
          params.search = searchQuery;
        }
        
        const data = await getContacts(params);
        setContacts(data);
        setError(null);
      } catch (err) {
        setError('Failed to load contacts. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchContacts();
  }, [excludeInactive, searchQuery]);
  
  // Toggle selection of all contacts
  const toggleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(c => c.id));
    }
  };
  
  // Toggle selection of a single contact
  const toggleSelectContact = (id: string) => {
    if (selectedContacts.includes(id)) {
      setSelectedContacts(selectedContacts.filter(contactId => contactId !== id));
    } else {
      setSelectedContacts([...selectedContacts, id]);
    }
  };
  
  // Toggle contact status
  const toggleContactStatus = async (contact: Contact) => {
    try {
      const newStatus = contact.status === 'active' ? 'inactive' : 'active';
      await updateContact(contact.id, { ...contact, status: newStatus });
      
      // Update local state
      setContacts(contacts.map(c => 
        c.id === contact.id ? { ...c, status: newStatus } : c
      ));
    } catch (err) {
      console.error('Failed to update contact status:', err);
    }
  };
  
  // Handle bulk actions
  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedContacts.length === 0) return;
    
    try {
      if (action === 'delete') {
        // Delete selected contacts
        await Promise.all(selectedContacts.map(id => deleteContact(id)));
        setContacts(contacts.filter(c => !selectedContacts.includes(c.id)));
      } else {
        // Update status of selected contacts
        const newStatus = action === 'activate' ? 'active' : 'inactive';
        await Promise.all(
          selectedContacts.map(id => {
            const contact = contacts.find(c => c.id === id);
            if (contact) {
              return updateContact(id, { ...contact, status: newStatus });
            }
            return Promise.resolve();
          })
        );
        
        // Update local state
        setContacts(contacts.map(c => 
          selectedContacts.includes(c.id) ? { ...c, status: newStatus } : c
        ));
      }
      
      // Clear selection
      setSelectedContacts([]);
    } catch (err) {
      console.error('Failed to perform bulk action:', err);
    }
  };
  
  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Contacts</h1>
        <div className="flex gap-2">
          <Button className="flex items-center gap-1" onClick={() => router.push('/contacts/new')}>
            <Plus size={16} />
            New Contact
          </Button>
          <Button variant="outline" className="flex items-center gap-1">
            <Upload size={16} />
            Import Contacts
          </Button>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Contacts Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-4">
            <div className="border-r pr-4">
              <div className="text-sm text-muted-foreground">Total Contacts</div>
              <div className="text-2xl font-bold">{totalContacts}</div>
            </div>
            <div className="border-r pr-4">
              <div className="text-sm text-muted-foreground">Active Contacts</div>
              <div className="text-2xl font-bold">{activeContacts}</div>
            </div>
            <div className="border-r pr-4">
              <div className="text-sm text-muted-foreground">Inactive Contacts</div>
              <div className="text-2xl font-bold">{inactiveContacts}</div>
            </div>
            <div className="border-r pr-4">
              <div className="text-sm text-muted-foreground">With Company</div>
              <div className="text-2xl font-bold">{contactsWithCompany}</div>
            </div>
            <div className="border-r pr-4">
              <div className="text-sm text-muted-foreground">Without Company</div>
              <div className="text-2xl font-bold">{contactsWithoutCompany}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Added Today</div>
              <div className="text-2xl font-bold">{contactsLoggedToday}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex items-center mb-4">
        <div className="flex items-center gap-2">
          <Checkbox 
            id="exclude-inactive" 
            checked={excludeInactive} 
            onCheckedChange={() => setExcludeInactive(!excludeInactive)} 
          />
          <label htmlFor="exclude-inactive" className="text-sm cursor-pointer">
            Exclude Inactive Contacts
          </label>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <select className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm">
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <Button variant="outline" size="sm">Export</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={selectedContacts.length === 0}>
                Bulk Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleBulkAction('activate')}>
                Mark as Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkAction('deactivate')}>
                Mark as Inactive
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkAction('delete')}>
                Delete Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Filter size={14} />
            Filter
          </Button>
        </div>
        <div>
          <Input 
            placeholder="Search..." 
            className="w-[250px]"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : contacts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No contacts found. Create your first contact to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox 
                      checked={selectedContacts.length === contacts.length && contacts.length > 0} 
                      onCheckedChange={toggleSelectAll} 
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedContacts.includes(contact.id)} 
                        onCheckedChange={() => toggleSelectContact(contact.id)} 
                      />
                    </TableCell>
                    <TableCell>
                      {contact.first_name} {contact.last_name}
                    </TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell>{contact.phone}</TableCell>
                    <TableCell>{contact.company}</TableCell>
                    <TableCell>{contact.position}</TableCell>
                    <TableCell>
                      <Switch 
                        checked={contact.status === 'active'} 
                        onCheckedChange={() => toggleContactStatus(contact)} 
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(contact.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/contacts/${contact.id}`)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/contacts/${contact.id}/edit`)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={async () => {
                            await deleteContact(contact.id);
                            setContacts(contacts.filter(c => c.id !== contact.id));
                          }}>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {contacts.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing 1 to {contacts.length} of {contacts.length} entries
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" disabled>
              <ChevronLeft size={16} />
            </Button>
            <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
              1
            </Button>
            <Button variant="outline" size="icon" disabled>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 