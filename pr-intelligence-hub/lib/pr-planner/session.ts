import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "@/lib/supabase/config";

// The planner deliberately uses only the publishable key: user-scoped RLS must
// remain effective even when a service-role key is configured for other flows.
export async function plannerSession() {
  const store = await cookies();
  const { url, publishableKey } = getSupabaseConfig();
  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (entries) => {
        try {
          entries.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Cookie writes are not possible from every Server Component.
        }
      },
    },
  });
  const { data: { user }, error } = await supabase.auth.getUser();
  return { supabase, user: error ? null : user };
}
