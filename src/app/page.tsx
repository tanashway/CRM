import { Button } from '@/components/ui/button';
import { SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs';
import Link from 'next/link';

export default function HomePage() {
  // In a real implementation, we would check authentication here
  // For now, we'll just show the landing page
  
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between">
          <div className="text-2xl font-bold">Personal CRM</div>
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline">Sign In</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button>Sign Up</Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        <section className="py-20">
          <div className="container mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">Manage Your Business Relationships</h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
              A comprehensive CRM system that connects business operations, invoicing, financials, and AI-driven automation.
            </p>
            <SignedOut>
              <SignUpButton mode="modal">
                <Button size="lg">Get Started</Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button size="lg">Go to Dashboard</Button>
              </Link>
            </SignedIn>
          </div>
        </section>
        
        <section className="py-20 bg-muted">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-10 text-center">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-card p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-2">Contact Management</h3>
                <p className="text-muted-foreground">Store and organize all your customer information in one place.</p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-2">Invoicing System</h3>
                <p className="text-muted-foreground">Create, send, and track invoices with ease.</p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-2">Task Management</h3>
                <p className="text-muted-foreground">Schedule and track follow-ups and tasks.</p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-2">AI Assistant</h3>
                <p className="text-muted-foreground">Execute business queries and automate workflows.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="border-t py-6">
        <div className="container mx-auto text-center text-muted-foreground">
          &copy; {new Date().getFullYear()} Personal CRM. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
