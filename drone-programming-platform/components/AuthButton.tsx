'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useDroneStore } from '@/lib/store'
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogOut, User, Settings, LogIn } from 'lucide-react'
import { toast } from 'sonner'

export function AuthButton() {
    const user = useDroneStore(state => state.user)
    const router = useRouter()
    const supabase = createClient()

    async function handleSignOut() {
        if (!supabase) return
        await supabase.auth.signOut()
        router.push('/auth/signout')
        router.refresh()
    }

    if (!user) {
        return (
            <Button
                variant="default"
                size="sm"
                className="bg-blue-600 hover:bg-blue-500 text-white font-black px-6 h-10 rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
                onClick={() => router.push('/auth/login')}
            >
                <LogIn className="w-4 h-4 mr-2" />
                SIGN IN
            </Button>
        )
    }

    // Generate initials
    const email = user.email || 'P'
    const initials = email.substring(0, 2).toUpperCase()

    return (
        <div className="flex items-center gap-2">
            <Link href="/profile" title="View Profile" className="transition-transform hover:scale-105 active:scale-95">
                <Button variant="ghost" className="relative h-11 w-11 rounded-2xl border border-white/10 hover:bg-white/5 p-0 bg-white/[0.02] backdrop-blur-sm">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={user.user_metadata?.avatar_url} alt={email} />
                        <AvatarFallback className="bg-blue-500/10 text-blue-400 font-black">{initials}</AvatarFallback>
                    </Avatar>
                </Button>
            </Link>
        </div>
    )
}
