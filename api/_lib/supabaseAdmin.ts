import { createClient } from "@supabase/supabase-js";

// Service-role client — NEVER import this from src/ (browser). API routes only.
const url = process.env.SUPABASE_URL || "https://dummy-url.supabase.co";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "dummy-key";

export const db = createClient(url, key, {
  auth: { persistSession: false },
});
