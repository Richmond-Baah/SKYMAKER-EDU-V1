import React from 'react'
import { ProfileHeader } from '@/components/profile/profile-header'
import { ProfileTabs } from '@/components/profile/profile-tabs'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProfileLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (!profile) {
        // Fallback for missing profile
        return <div>Profile not found. Please contact support.</div>
    }

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300 pb-20">
            <main className="container mx-auto px-4 md:px-6 pt-8 space-y-8">
                <ProfileHeader profile={profile} />
                <ProfileTabs />
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {children}
                </div>
            </main>
        </div>
    )
}
