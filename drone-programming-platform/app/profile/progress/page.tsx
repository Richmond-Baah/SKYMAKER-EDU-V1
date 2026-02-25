import React from 'react'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { SkillRadarChart } from '@/components/profile/skill-radar-chart'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Play } from 'lucide-react'

export default async function ProgressPage() {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Fetch user stats for skill radar
    const { data: stats } = await supabase
        .from('user_stats')
        .select('skill_levels')
        .eq('user_id', user.id)
        .single()

    // Mock mission history for now (will integrate with real attempts table later)
    const missionHistory = [
        { id: 'M-01', title: 'Takeoff & Land', score: 100, time: '2m 15s', attempts: 1, date: '2026-02-15' },
        { id: 'M-02', title: 'Basic Maneuvers', score: 92, time: '4m 30s', attempts: 2, date: '2026-02-16' },
        { id: 'M-03', title: 'Pattern Flight', score: 85, time: '6m 10s', attempts: 3, date: '2026-02-17' },
        { id: 'M-04', title: 'Advanced Stability', score: 95, time: '5m 05s', attempts: 1, date: '2026-02-18' },
    ]

    const defaultSkills = {
        control: 0,
        stability: 0,
        logic: 0,
        efficiency: 0,
        creativity: 0,
        debugging: 0,
        planning: 0,
        execution: 0
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <SkillRadarChart skills={stats?.skill_levels || defaultSkills} />

                <Card className="border-border bg-card shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold">Mission Progress</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Beginner Track</p>
                                <p className="text-2xl font-black text-foreground">40%</p>
                            </div>
                            <div className="h-4 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: '40%' }} />
                            </div>
                            <p className="text-xs text-muted-foreground font-medium italic">You&apos;re doing great! Complete 3 more missions to unlock the Intermediate Track.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-muted/50 rounded-xl border border-border">
                                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Average Score</p>
                                <p className="text-2xl font-bold text-foreground">93%</p>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-xl border border-border">
                                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Total Attempts</p>
                                <p className="text-2xl font-bold text-foreground">7</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-border bg-card shadow-sm">
                <CardHeader>
                    <CardTitle className="text-xl font-bold">Mission History</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border hover:bg-transparent">
                                <TableHead className="font-bold text-muted-foreground">MISSION</TableHead>
                                <TableHead className="font-bold text-muted-foreground">SCORE</TableHead>
                                <TableHead className="font-bold text-muted-foreground">TIME</TableHead>
                                <TableHead className="font-bold text-muted-foreground text-center">ATTEMPTS</TableHead>
                                <TableHead className="font-bold text-muted-foreground">DATE</TableHead>
                                <TableHead className="font-bold text-muted-foreground text-right">ACTION</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {missionHistory.map((mission) => (
                                <TableRow key={mission.id} className="border-border group transition-colors">
                                    <TableCell className="font-bold text-foreground">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-mono text-muted-foreground mb-0.5">{mission.id}</span>
                                            {mission.title}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className={`font-black ${mission.score >= 90 ? 'text-green-500' : 'text-blue-500'}`}>
                                            {mission.score}%
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-muted-foreground">{mission.time}</TableCell>
                                    <TableCell className="text-center">
                                        <span className="bg-muted px-2 py-1 rounded text-xs font-bold">{mission.attempts}</span>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {new Date(mission.date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <button className="p-2 transition-all hover:scale-110 text-blue-500 hover:text-blue-400">
                                            <Play className="w-5 h-5 fill-current" />
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
