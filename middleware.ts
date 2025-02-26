import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This middleware handles Clerk authentication
export default function middleware(request: NextRequest) {
  // Apply Clerk middleware
  const clerkResponse = clerkMiddleware()(request);
  
  // Return the Clerk response
  return clerkResponse;
}

export const config = {
  matcher: [
    // Protect all routes except public ones
    '/((?!_next|sign-in|sign-up|api/webhook/clerk|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes except webhook
    '/(api(?!/webhook/clerk))(.*)',
  ],
};