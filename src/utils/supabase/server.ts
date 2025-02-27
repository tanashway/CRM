import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = (cookieStore: ReturnType<typeof cookies>) => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookiesStore = await cookieStore;
          return cookiesStore.get(name)?.value;
        },
        async set(name: string, value: string, options: { path: string }) {
          try {
            const cookiesStore = await cookieStore;
            cookiesStore.set(name, value, { path: options.path });
          } catch {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        async remove(name: string, options: { path: string }) {
          try {
            const cookiesStore = await cookieStore;
            cookiesStore.delete(name);
          } catch {
            // The `remove` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
}; 