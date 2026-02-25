import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client for use in Server Components, Server Actions, or Route Handlers.
 * It automatically handles cookie persistence.
 */
export function createServerSupabaseClient() {
    const cookieStore = cookies()
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
        throw new Error('Supabase URL or Anon Key is missing in server context.')
    }

    return createServerClient(url, key, {
        cookies: {
            get(name: string) {
                return cookieStore.get(name)?.value
            },
            set(name: string, value: string, options: CookieOptions) {
                try {
                    cookieStore.set({ name, value, ...options })
                } catch (error) {
                    // This can happen if the client is used in a Server Component that is streaming
                }
            },
            remove(name: string, options: CookieOptions) {
                try {
                    cookieStore.set({ name, value: '', ...options })
                } catch (error) {
                    // This can happen if the client is used in a Server Component that is streaming
                }
            },
        },
    })
}

/**
 * Admin client for bypasssing RLS. USE WITH EXTREME CAUTION and ONLY on the server.
 * This should only be used in specific backend logic (e.g. initial profile creation).
 */
export function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key || key === 'your_service_role_key_here') {
        console.warn('SUPABASE_SERVICE_ROLE_KEY is missing or using placeholder. Admin operations will fail.')
        return null
    }

    return createClient(url, key)
}
