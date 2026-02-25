import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase client for use in Browser/Client Components.
 * Environment variables must be prefixed with NEXT_PUBLIC_ to be accessible here.
 */
export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
        throw new Error(
            'Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) are missing. ' +
            'Please ensure they are defined in .env.local and restart your development server.'
        )
    }

    return createBrowserClient(url, key)
}

/**
 * A singleton instance of the Supabase client for client-side usage.
 * Use this in components that don't need a fresh client on every render.
 */
export const supabase = typeof window !== 'undefined'
    ? createClient()
    : (null as any) // Placeholder for SSR hydration, createClient() should be used in useEffect or server-side
