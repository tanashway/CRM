import { NextResponse } from "next/server";
import { supabaseAdmin } from "./lib/supabase/server";
import { NextRequest } from "next/server";

// This function will be called after successful authentication
async function syncUserToSupabase(userId: string | null) {
  if (!userId) return;
  
  try {
    // Check if user exists in Supabase
    const { error } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();
    
    // If user doesn't exist, create them
    if (error && error.code === 'PGRST116') {
      console.log('Creating new user in Supabase:', userId);
      await supabaseAdmin
        .from('users')
        .insert({
          clerk_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
    }
  } catch (error) {
    console.error('Error syncing user to Supabase:', error);
  }
}

// Import auth before using it
import { auth } from "@clerk/nextjs/server";

// This middleware handles authentication and user syncing
export default async function middleware() {
  // Get the user ID from the request
  const { userId } = await auth();
  
  // If the user is authenticated, sync them to Supabase
  if (userId) {
    await syncUserToSupabase(userId);
  }
  
  // Continue with the request
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}; 