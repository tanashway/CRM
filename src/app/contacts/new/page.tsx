import { Metadata } from "next";
import { ContactForm } from "@/components/contacts/contact-form";

export const metadata: Metadata = {
  title: "Add New Contact | Personal CRM",
  description: "Add a new contact to your personal CRM",
};

export default function NewContactPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Add New Contact</h1>
        <p className="text-muted-foreground mt-2">
          Create a new contact in your personal network
        </p>
      </div>
      
      <div className="rounded-lg border bg-card p-8">
        <ContactForm />
      </div>
    </div>
  );
} 