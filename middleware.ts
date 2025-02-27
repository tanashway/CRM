import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Use clerkMiddleware with two arguments
export default clerkMiddleware(async (auth, req) => {
  // By default, all routes are public
  // If you want to protect specific routes, you can use auth.protect()
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Protect all routes except public ones
    '/((?!_next|sign-in|sign-up|api/webhook/clerk|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes except webhook
    '/(api(?!/webhook/clerk))(.*)',
  ],
};