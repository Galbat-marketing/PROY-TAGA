import { createSupabaseClient } from "./supabase.ts"

export async function verifyAdmin(req: Request): Promise<{
  user: unknown | null
  isAdmin: boolean
  error: Response | null
}> {
  const supabase = createSupabaseClient(req)
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { user: null, isAdmin: false, error: unauthorized() }
  }

  const { data: roles } = await supabase
    .from("roles_usuarios")
    .select("roles!inner(nombre)")
    .eq("usuario_id", user.id)

  const isAdmin = roles?.some(
    (r) => (r.roles as { nombre?: string })?.nombre === "admin"
  ) ?? false

  return { user, isAdmin, error: null }
}

function unauthorized(): Response {
  return new Response(
    JSON.stringify({ error: true, message: "No autorizado" }),
    {
      status: 401,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    }
  )
}
