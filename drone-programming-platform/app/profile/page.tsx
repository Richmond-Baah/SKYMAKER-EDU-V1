import React from 'react'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { StatsCards } from '@/components/profile/stats-cards'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Activity, Trophy, Flame } from 'lucide-react'
import { ProfileLogoutButton } from '@/components/profile/ProfileLogoutButton'
import { BackButton } from '@/components/navigation/BackButton'

export default async function ProfileOverviewPage() {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Fetch user stats
    const { data: stats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single()

    // Fetch recent activity
    const { data: activities } = await supabase
        .from('activity_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

    const defaultStats = {
        missions_completed: 0,
        total_stars: 0,
        badges_earned: 0,
        total_time_seconds: 0,
        current_streak_days: 0,
        total_lines_of_code: 0,
    }

    return (
        <div className="space-y-8">
            <BackButton />
            <StatsCards stats={stats || defaultStats} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Activity Feed */}
                <Card className="lg:col-span-2 border-border bg-card shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-xl font-bold">
                            <Activity className="w-5 h-5 text-blue-500" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {activities && activities.length > 0 ? (
                            <div className="space-y-6">
                                {activities.map((activity) => (
                                    <div key={activity.id} className="flex gap-4 items-start group">
                                        <div className="mt-1 p-2 bg-muted rounded-full group-hover:bg-primary/10 transition-colors">
                                            {activity.activity_type === 'mission_completed' && <Trophy className="w-4 h-4 text-yellow-500" />}
                                            {activity.activity_type === 'badge_earned' && <Trophy className="w-4 h-4 text-purple-500" />}
                                            {activity.activity_type === 'goal_achieved' && <Flame className="w-4 h-4 text-orange-500" />}
                                        </div>
                                        <div className="flex-1 border-b border-border pb-4 group-last:border-0">
                                            <p className="font-bold text-foreground">{activity.activity_description}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(activity.created_at).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center space-y-3">
                                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                                    <Activity className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <p className="text-muted-foreground font-medium">No activity logged yet. Start a mission to see your progress!</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Sidebar Cards */}
                <div className="space-y-8">
                    {/* Current Goals Preview */}
                    <Card className="border-border bg-card shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Next Milestone</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-muted/50 rounded-xl border border-border">
                                <p className="text-xs font-bold text-blue-500 uppercase mb-1">Mission Master</p>
                                <p className="text-sm font-bold text-foreground mb-2">Complete 10 Missions</p>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '40%' }} />
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-2 font-mono">4 / 10 COMPLETED</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Streak Info */}
                    <Card className="border-border bg-card shadow-sm overflow-hidden group">
                        <CardHeader className="relative z-10">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Flame className="w-5 h-5 text-orange-500 group-hover:animate-bounce" />
                                Hot Streak
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <p className="text-4xl font-black text-foreground mb-1">{stats?.current_streak_days || 0} DAYS</p>
                            <p className="text-sm text-muted-foreground">Keep flying daily to increase your rank!</p>
                        </CardContent>
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-500">
                            <Flame className="w-24 h-24 text-orange-500" />
                        </div>
                    </Card>

                    {/* Account Controls */}
                    <Card className="border-border bg-card shadow-sm border-dashed">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Account Action</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ProfileLogoutButton />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
