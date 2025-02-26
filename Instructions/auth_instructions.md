# Authentication Implementation Guidelines

## Clerk Authentication Setup

### Initial Setup

1. **Create a Clerk Account**
   - Sign up at [clerk.com](https://clerk.com)
   - Create a new application in the Clerk dashboard
   - Note your API keys (publishable key and secret key)

2. **Environment Variables**
   - Create a `.env.local` file in the project root
   - Add the following environment variables:
     ```
     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
     CLERK_SECRET_KEY=your_secret_key
     NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
     NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
     NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
     NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
     ```

### Integration with Next.js

1. **Install Clerk SDK**
   - Run `npm install @clerk/nextjs`

2. **Configure Clerk Provider**
   - Update `src/app/layout.tsx` to include the ClerkProvider:
     ```tsx
     import { ClerkProvider } from '@clerk/nextjs';
     
     export default function RootLayout({
       children,
     }: {
       children: React.ReactNode;
     }) {
       return (
         <html lang="en">
           <ClerkProvider>
             <body>{children}</body>
           </ClerkProvider>
         </html>
       );
     }
     ```

3. **Create Authentication Middleware**
   - Create a `middleware.ts` file in the project root:
     ```tsx
     import { authMiddleware } from '@clerk/nextjs';
     
     export default authMiddleware({
       publicRoutes: ['/', '/sign-in', '/sign-up', '/api/webhook/clerk'],
     });
     
     export const config = {
       matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
     };
     ```

### Authentication Components

1. **Sign In Page**
   - Create `src/app/sign-in/page.tsx`:
     ```tsx
     import { SignIn } from '@clerk/nextjs';
     
     export default function SignInPage() {
       return (
         <div className="flex justify-center items-center min-h-screen">
           <SignIn />
         </div>
       );
     }
     ```

2. **Sign Up Page**
   - Create `src/app/sign-up/page.tsx`:
     ```tsx
     import { SignUp } from '@clerk/nextjs';
     
     export default function SignUpPage() {
       return (
         <div className="flex justify-center items-center min-h-screen">
           <SignUp />
         </div>
       );
     }
     ```

3. **User Profile**
   - Create `src/app/profile/page.tsx`:
     ```tsx
     import { UserProfile } from '@clerk/nextjs';
     
     export default function ProfilePage() {
       return (
         <div className="flex justify-center items-center min-h-screen">
           <UserProfile />
         </div>
       );
     }
     ```

### Supabase Integration

1. **Clerk Webhook Setup**
   - In the Clerk dashboard, create a webhook endpoint pointing to `/api/webhook/clerk`
   - Select the user events to trigger the webhook (user.created, user.updated, etc.)

2. **Webhook Handler**
   - Create `src/app/api/webhook/clerk/route.ts`:
     ```tsx
     import { Webhook } from 'svix';
     import { headers } from 'next/headers';
     import { WebhookEvent } from '@clerk/nextjs/server';
     import { createClient } from '@supabase/supabase-js';

     export async function POST(req: Request) {
       // Verify the webhook signature
       const headerPayload = headers();
       const svix_id = headerPayload.get('svix-id');
       const svix_timestamp = headerPayload.get('svix-timestamp');
       const svix_signature = headerPayload.get('svix-signature');
       
       if (!svix_id || !svix_timestamp || !svix_signature) {
         return new Response('Missing svix headers', { status: 400 });
       }
       
       // Get the body
       const payload = await req.json();
       const body = JSON.stringify(payload);
       
       // Create a new Svix instance with your webhook secret
       const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');
       
       let evt: WebhookEvent;
       
       // Verify the payload with the headers
       try {
         evt = wh.verify(body, {
           'svix-id': svix_id,
           'svix-timestamp': svix_timestamp,
           'svix-signature': svix_signature,
         }) as WebhookEvent;
       } catch (err) {
         return new Response('Error verifying webhook', { status: 400 });
       }
       
       // Handle the webhook event
       const eventType = evt.type;
       
       // Initialize Supabase client
       const supabase = createClient(
         process.env.NEXT_PUBLIC_SUPABASE_URL || '',
         process.env.SUPABASE_SERVICE_ROLE_KEY || ''
       );
       
       if (eventType === 'user.created' || eventType === 'user.updated') {
         const { id, email_addresses, first_name, last_name } = evt.data;
         const email = email_addresses[0]?.email_address;
         
         // Upsert user in Supabase
         const { error } = await supabase
           .from('users')
           .upsert({
             clerk_id: id,
             email: email,
             first_name: first_name || '',
             last_name: last_name || '',
             updated_at: new Date().toISOString(),
           })
           .match({ clerk_id: id });
         
         if (error) {
           console.error('Error upserting user:', error);
           return new Response('Error upserting user', { status: 500 });
         }
       }
       
       return new Response('Webhook received', { status: 200 });
     }
     ```

### User Management

1. **Current User Hook**
   - Create `src/hooks/useCurrentUser.ts`:
     ```tsx
     import { useUser } from '@clerk/nextjs';
     import { useQuery } from '@tanstack/react-query';
     import { createClient } from '@supabase/supabase-js';

     export function useCurrentUser() {
       const { user, isLoaded, isSignedIn } = useUser();
       
       const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
       const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
       const supabase = createClient(supabaseUrl, supabaseAnonKey);
       
       return useQuery({
         queryKey: ['currentUser', user?.id],
         queryFn: async () => {
           if (!isSignedIn || !user) return null;
           
           const { data, error } = await supabase
             .from('users')
             .select('*')
             .eq('clerk_id', user.id)
             .single();
           
           if (error) throw error;
           return data;
         },
         enabled: isLoaded && isSignedIn,
       });
     }
     ```

2. **Protected Routes Component**
   - Create `src/components/auth/ProtectedRoute.tsx`:
     ```tsx
     import { useAuth } from '@clerk/nextjs';
     import { useRouter } from 'next/navigation';
     import { useEffect } from 'react';

     export function ProtectedRoute({ children }: { children: React.ReactNode }) {
       const { isLoaded, isSignedIn } = useAuth();
       const router = useRouter();
       
       useEffect(() => {
         if (isLoaded && !isSignedIn) {
           router.push('/sign-in');
         }
       }, [isLoaded, isSignedIn, router]);
       
       if (!isLoaded || !isSignedIn) {
         return <div>Loading...</div>;
       }
       
       return <>{children}</>;
     }
     ```

## Security Best Practices

1. **Environment Variables**
   - Never expose the Clerk Secret Key in client-side code
   - Use environment variables for all sensitive information
   - Add `.env.local` to `.gitignore`

2. **Webhook Security**
   - Verify webhook signatures to prevent unauthorized requests
   - Use HTTPS for all webhook endpoints
   - Implement rate limiting for webhook endpoints

3. **User Data**
   - Store minimal user data in Supabase
   - Use Row Level Security (RLS) in Supabase to restrict access
   - Implement proper error handling for authentication failures

4. **Session Management**
   - Use Clerk's session management features
   - Implement proper session timeouts
   - Provide a secure logout mechanism 