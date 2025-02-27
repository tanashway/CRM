import { supabaseAdmin } from "./supabase/server";

export async function syncUserToSupabase(userId: string) {
  try {
    const { error } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // User doesn't exist yet
        await supabaseAdmin.from("users").insert({
          clerk_id: userId,
        });
      } else {
        console.error("Error checking if user exists:", error);
      }
    }
  } catch (error) {
    console.error("Error syncing user to Supabase:", error);
  }
} 