import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Target, Star, Trophy, Flame, Clock, Code } from 'lucide-react'

interface StatsCardsProps {
    stats: {
        missions_completed: number;
        total_stars: number;
        badges_earned: number;
        total_time_seconds: number;
        current_streak_days: number;
        total_lines_of_code: number;
    }
}

export function StatsCards({ stats }: StatsCardsProps) {
    const hours = Math.floor(stats.total_time_seconds / 3600)

    const items = [
        {
            label: 'Missions Completed',
            value: stats.missions_completed,
            icon: Target,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10'
        },
        {
            label: 'Total Stars',
            value: stats.total_stars,
            icon: Star,
            color: 'text-yellow-500',
            bg: 'bg-yellow-500/10'
        },
        {
            label: 'Badges Earned',
            value: stats.badges_earned,
            icon: Trophy,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10'
        },
        {
            label: 'Current Streak',
            value: `${stats.current_streak_days} Days`,
            icon: Flame,
            color: 'text-orange-500',
            bg: 'bg-orange-500/10'
        },
        {
            label: 'Flight Time',
            value: `${hours} Hours`,
            icon: Clock,
            color: 'text-green-500',
            bg: 'bg-green-500/10'
        },
        {
            label: 'Lines of Code',
            value: stats.total_lines_of_code,
            icon: Code,
            color: 'text-pink-500',
            bg: 'bg-pink-500/10'
        },
    ]

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {items.map((item, i) => (
                <Card key={i} className="border-border bg-card shadow-sm hover:border-primary/20 transition-all active:scale-95">
                    <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                        <div className={`p-2 rounded-xl ${item.bg}`}>
                            <item.icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-2xl font-bold tracking-tight text-foreground">{item.value}</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground line-clamp-1">{item.label}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
