import { Suspense } from 'react';
import ContactDetailClient from './detail-client';

interface ContactDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ContactDetailPage(props: ContactDetailPageProps) {
  // Resolve the params in the server component
  const params = await props.params;
  
  return (
    <Suspense fallback={<div className="container mx-auto py-10 flex justify-center items-center min-h-[60vh]">Loading...</div>}>
      <ContactDetailClient params={params} />
    </Suspense>
  );
} 