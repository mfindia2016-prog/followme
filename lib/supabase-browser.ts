import { createBrowserClient } from "@supabase/ssr";

const supabaseBrowser = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export { supabaseBrowser };

export function createClient() {
  return supabaseBrowser;
}
