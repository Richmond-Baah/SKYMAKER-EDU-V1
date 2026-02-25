"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { BarChart3, TrendingUp, Trophy, Briefcase, Settings, HelpCircle } from 'lucide-react'

const TABS = [
    { id: 'overview', label: 'Overview', icon: BarChart3, path: '/profile' },
    { id: 'progress', label: 'Progress', icon: TrendingUp, path: '/profile/progress' },
    { id: 'badges', label: 'Badges', icon: Trophy, path: '/profile/badges' },
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase, path: '/profile/portfolio' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/profile/settings' },
    { id: 'help', label: 'Help', icon: HelpCircle, path: '/profile/help' },
]

export function ProfileTabs() {
    const pathname = usePathname()

    return (
        <div className="flex overflow-x-auto pb-4 mb-8 border-b border-border scrollbar-hide">
            <div className="flex min-w-full md:min-w-0 space-x-1">
                {TABS.map((tab) => {
                    const isActive = pathname === tab.path
                    const Icon = tab.icon

                    return (
                        <Link
                            key={tab.id}
                            href={tab.path}
                            className={cn(
                                "flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all rounded-xl border-b-2",
                                isActive
                                    ? "text-blue-600 border-blue-600 bg-blue-50 dark:bg-blue-900/10"
                                    : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted"
                            )}
                        >
                            <Icon className={cn("w-4 h-4", isActive ? "text-blue-600" : "text-muted-foreground")} />
                            {tab.label}
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
