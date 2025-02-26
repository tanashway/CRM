"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Phone, Building, Briefcase, Calendar, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getContact, deleteContact } from "@/lib/contacts-service";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface ContactDetailPageProps {
  params: {
    id: string;
  };
}

export default function ContactDetailPage(props: ContactDetailPageProps) {
  const router = useRouter();
  const contactId = props.params.id;
  const [contact, setContact] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchContact = async () => {
      if (!contactId) {
        setError("Invalid contact ID");
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const data = await getContact(contactId);
        setContact(data);
      } catch (err) {
        console.error("Error fetching contact:", err);
        setError("Failed to load contact. Please try again.");
        toast({
          title: "Error",
          description: "Failed to load contact. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchContact();
  }, [contactId]);

  const handleDelete = async () => {
    if (!contactId) {
      toast({
        title: "Error",
        description: "Invalid contact ID",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsDeleting(true);
      await deleteContact(contactId);
      toast({
        title: "Contact deleted",
        description: "The contact has been deleted successfully.",
      });
      router.push("/contacts");
      router.refresh();
    } catch (err) {
      console.error("Error deleting contact:", err);
      toast({
        title: "Error",
        description: "Failed to delete contact. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading contact...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-8 text-center">
          <h2 className="text-xl font-semibold text-destructive mb-2">Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="mt-4"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Contact Details</h1>
          <p className="text-muted-foreground mt-2">
            View information for {contact?.first_name} {contact?.last_name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/contacts/${contactId}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Contact</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete {contact?.first_name} {contact?.last_name}? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Contact details and information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">First Name</h3>
                <p className="text-base">{contact?.first_name || "—"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Last Name</h3>
                <p className="text-base">{contact?.last_name || "—"}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
              <div className="flex items-center gap-2 mt-1">
                {contact?.email ? (
                  <>
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                      {contact.email}
                    </a>
                  </>
                ) : (
                  <p className="text-muted-foreground italic">No email provided</p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
              <div className="flex items-center gap-2 mt-1">
                {contact?.phone ? (
                  <>
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${contact.phone}`} className="text-primary hover:underline">
                      {contact.phone}
                    </a>
                  </>
                ) : (
                  <p className="text-muted-foreground italic">No phone provided</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Company</h3>
                <div className="flex items-center gap-2 mt-1">
                  {contact?.company ? (
                    <>
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <p>{contact.company}</p>
                    </>
                  ) : (
                    <p className="text-muted-foreground italic">No company provided</p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Position</h3>
                <div className="flex items-center gap-2 mt-1">
                  {contact?.position ? (
                    <>
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <p>{contact.position}</p>
                    </>
                  ) : (
                    <p className="text-muted-foreground italic">No position provided</p>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
              <div className="mt-1 p-3 bg-muted/50 rounded-md">
                {contact?.notes ? (
                  <p className="whitespace-pre-wrap">{contact.notes}</p>
                ) : (
                  <p className="text-muted-foreground italic">No notes provided</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Status & Dates</CardTitle>
            <CardDescription>Contact status and important dates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <div className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  contact?.status === "active" 
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" 
                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                }`}>
                  {contact?.status === "active" ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p>
                  {contact?.created_at 
                    ? new Date(contact.created_at).toLocaleDateString() 
                    : "Unknown"}
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p>
                  {contact?.updated_at 
                    ? new Date(contact.updated_at).toLocaleDateString() 
                    : "Unknown"}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push("/contacts")}
            >
              Back to Contacts
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 