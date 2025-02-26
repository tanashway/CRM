import { SignIn } from '@clerk/nextjs';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | Personal CRM',
  description: 'Sign in to your Personal CRM account',
};

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Personal CRM</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Sign in to your account</p>
      </div>
      <div className="w-full max-w-md">
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-lg rounded-lg border border-slate-200 dark:border-slate-700",
              headerTitle: "text-xl font-semibold text-slate-900 dark:text-slate-100",
              headerSubtitle: "text-slate-600 dark:text-slate-400",
              formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
              formFieldLabel: "text-slate-700 dark:text-slate-300",
              formFieldInput: "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800",
              footerActionLink: "text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300",
            },
          }}
          routing="path"
          path="/sign-in"
        />
      </div>
    </div>
  );
} 