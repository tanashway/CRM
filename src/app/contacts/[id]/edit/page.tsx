"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ContactForm } from "@/components/contacts/contact-form";
import { getContact } from "@/lib/contacts-service";
import { toast } from "@/components/ui/use-toast";
import { Contact } from "@/lib/contacts-service";

interface EditContactPageProps {
  params: {
    id: string;
  };
}

export default function EditContactPage(props: EditContactPageProps) {
  const router = useRouter();
  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get the ID safely
  const contactId = typeof props.params === 'object' && props.params !== null 
    ? props.params.id 
    : '';

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

  const handleSuccess = () => {
    toast({
      title: "Contact updated",
      description: "The contact has been updated successfully.",
    });
    router.push("/contacts");
    router.refresh();
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
          <button
            onClick={() => router.back()}
            className="mt-4 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Contact</h1>
        <p className="text-muted-foreground mt-2">
          Update information for {contact?.first_name} {contact?.last_name}
        </p>
      </div>
      
      <div className="rounded-lg border bg-card p-8">
        <ContactForm initialData={contact} onSuccess={handleSuccess} />
      </div>
    </div>
  );
} 