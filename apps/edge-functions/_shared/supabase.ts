import { createClient } from "https://esm.sh/@supabase/supabase-js@2.46.1"

export function createSupabaseClient(req: Request) {
  const authHeader = req.headers.get("Authorization") ?? ""
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
  const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") ?? ""

  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: { Authorization: authHeader },
    },
    auth: {
      persistSession: false,
    },
  })
}
