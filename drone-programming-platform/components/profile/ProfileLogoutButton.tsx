'use client'

import React from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { toast } from 'sonner'

export function ProfileLogoutButton() {
    const router = useRouter()
    const supabase = createClient()

    async function handleSignOut() {
        if (!supabase) return
        await supabase.auth.signOut()
        router.push('/auth/signout')
        router.refresh()
    }

    return (
        <Button
            variant="outline"
            className="w-full justify-start gap-2 border-red-500/20 text-red-500 hover:bg-red-500/10 hover:border-red-500/50 h-11 px-4 font-bold rounded-xl"
            onClick={handleSignOut}
        >
            <LogOut className="w-4 h-4" />
            Sign Out of SkyMaker
        </Button>
    )
}
