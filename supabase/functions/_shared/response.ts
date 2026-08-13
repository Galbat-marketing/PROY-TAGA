import { corsHeaders } from "./cors.ts"

export function ok<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  })
}

export function badRequest(message: string): Response {
  return new Response(
    JSON.stringify({ error: true, message }),
    {
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    }
  )
}

export function unauthorized(message = "No autorizado"): Response {
  return new Response(
    JSON.stringify({ error: true, message }),
    {
      status: 401,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    }
  )
}

export function notFound(message = "No encontrado"): Response {
  return new Response(
    JSON.stringify({ error: true, message }),
    {
      status: 404,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    }
  )
}

export function serverError(error: unknown): Response {
  console.error("Server error:", error)
  return new Response(
    JSON.stringify({
      error: true,
      message: "Error interno del servidor",
    }),
    {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    }
  )
}
