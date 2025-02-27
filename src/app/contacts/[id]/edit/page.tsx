import { Suspense } from 'react';
import EditContactClient from './edit-client';

interface EditContactPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditContactPage(props: EditContactPageProps) {
  // Resolve the params in the server component
  const params = await props.params;
  
  return (
    <Suspense fallback={<div className="container mx-auto py-10 flex justify-center items-center min-h-[60vh]">Loading...</div>}>
      <EditContactClient params={params} />
    </Suspense>
  );
} 