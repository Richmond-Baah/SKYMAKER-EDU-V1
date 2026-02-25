"use client"

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useDroneStore } from '../lib/store'
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js'

export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()
    const { updateMetrics, currentLessonId, setCompletedLessons, setUser: setStoreUser } = useDroneStore()

    const syncProgress = useCallback(async (userId: string) => {
        if (!supabase) return

        // Fetch profile - progress isn't a column in profiles
        const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single()

        if (data) {
            // Update store with role
            useDroneStore.setState({
                role: data.role || 'student'
            })
            console.log('✅ Auth Sync: Role set to', data.role)
        } else if (error) {
            console.error('❌ Auth Sync Error:', error.message)
            // Fallback to student if error
            useDroneStore.setState({ role: 'student' })
        }
    }, [supabase])

    useEffect(() => {
        if (!supabase) {
            setLoading(false)
            return
        }

        // Initial session check
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setUser(session?.user ?? null)
            setStoreUser(session?.user ?? null)
            setLoading(false)
            if (session?.user) {
                // Fetch progress from DB
                syncProgress(session.user.id)
            }
        }

        checkUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
            setUser(session?.user ?? null)
            setStoreUser(session?.user ?? null)
            if (session?.user) {
                syncProgress(session.user.id)
            }
        })

        return () => subscription.unsubscribe()
    }, [supabase, setStoreUser, syncProgress])

    // Save progress when it changes?
    // This hook is for Auth state. 
    // Data syncing is tricky here without causing loops.
    // Better to have separate sync logic.

    return { user, loading, supabase }
}
