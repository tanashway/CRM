import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { syncUserToSupabase } from "@/lib/sync-user";

export async function GET() {
  try {
    const authObject = await auth();
    const userId = authObject.userId;
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    await syncUserToSupabase(userId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error syncing user:", error);
    return NextResponse.json(
      { error: "Failed to sync user" },
      { status: 500 }
    );
  }
} 