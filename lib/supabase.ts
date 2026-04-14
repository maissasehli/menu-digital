import { createBrowserClient } from '@supabase/ssr'

// ✅ FIX: Ne jamais créer d'instance Supabase au top-level d'un module.
// createBrowserClient lit process.env au moment de l'appel —
// pendant le build Vercel ces variables ne sont pas encore injectées,
// ce qui provoque "supabaseUrl is required" et fait crasher le build.
//
// Solution : exporter une fonction factory, appelée uniquement
// à l'intérieur des composants ou hooks (côté client, après hydration).

export function createSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}