import { AIChat } from '@/components/ai/AIChat';

export default function AIPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">AI Assistant</h1>
      <p className="text-muted-foreground mb-6">
        Ask questions about your business data or request actions like scheduling follow-ups or creating invoices.
      </p>
      <AIChat />
    </div>
  );
} 