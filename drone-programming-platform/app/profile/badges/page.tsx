import React from 'react'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge as UIBadge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Trophy, Star, Shield, Zap, Users, Lock, CheckCircle2 } from 'lucide-react'

interface Badge {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    category: 'achievement' | 'milestone' | 'social' | 'skill';
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    earned: boolean;
    earnedAt?: string;
    progress?: {
        current: number;
        target: number;
    };
}

export default async function BadgesPage() {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Fetch earned badges for this user
    const { data: earnedBadges } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', user.id)

    const earnedIds = new Set(earnedBadges?.map(b => b.badge_id) || [])

    const ALL_BADGES: Badge[] = [
        {
            id: 'first_flight',
            name: 'First Flight',
            description: 'Complete Mission 1',
            icon: <Zap className="w-8 h-8" />,
            category: 'achievement',
            rarity: 'common',
            earned: earnedIds.has('first_flight'),
            earnedAt: earnedBadges?.find(b => b.badge_id === 'first_flight')?.earned_at
        },
        {
            id: 'perfect_landing',
            name: 'Perfect Landing',
            description: 'Land within 10cm of target',
            icon: <Star className="w-8 h-8" />,
            category: 'skill',
            rarity: 'rare',
            earned: earnedIds.has('perfect_landing')
        },
        {
            id: 'mission_master',
            name: 'Mission Master',
            description: 'Complete all beginner missions',
            icon: <Trophy className="w-8 h-8" />,
            category: 'milestone',
            rarity: 'epic',
            earned: earnedIds.has('mission_master'),
            progress: { current: 4, target: 10 }
        },
        {
            id: 'team_player',
            name: 'Team Player',
            description: 'Help 5 peers with code reviews',
            icon: <Users className="w-8 h-8" />,
            category: 'social',
            rarity: 'common',
            earned: earnedIds.has('team_player'),
            progress: { current: 2, target: 5 }
        },
        {
            id: 'logic_king',
            name: 'Logic King',
            description: 'Complete all nested loop missions',
            icon: <Shield className="w-8 h-8" />,
            category: 'skill',
            rarity: 'legendary',
            earned: earnedIds.has('logic_king')
        }
    ]

    const categories = [
        { id: 'all', label: 'All Badges', icon: <Trophy className="w-4 h-4" /> },
        { id: 'achievement', label: 'Achievements', icon: <Zap className="w-4 h-4" /> },
        { id: 'milestone', label: 'Milestones', icon: <Star className="w-4 h-4" /> },
        { id: 'skill', label: 'Skills', icon: <Shield className="w-4 h-4" /> },
        { id: 'social', label: 'Social', icon: <Users className="w-4 h-4" /> },
    ]

    const rarityColors = {
        common: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
        rare: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        epic: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
        legendary: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Badge Gallery</h2>
                    <p className="text-muted-foreground">Unlock rewards as you progress through missions.</p>
                </div>
                <div className="bg-muted px-4 py-2 rounded-xl flex items-center gap-2 border border-border">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span className="font-bold text-foreground">{earnedIds.size} / {ALL_BADGES.length} Badges Earned</span>
                </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="bg-muted p-1 rounded-xl h-auto flex flex-wrap gap-1 border border-border mb-8">
                    {categories.map(cat => (
                        <TabsTrigger
                            key={cat.id}
                            value={cat.id}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                        >
                            {cat.icon}
                            {cat.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {categories.map(cat => (
                    <TabsContent key={cat.id} value={cat.id}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {ALL_BADGES
                                .filter(b => cat.id === 'all' || b.category === cat.id)
                                .map(badge => (
                                    <Card
                                        key={badge.id}
                                        className={`relative overflow-hidden border-border transition-all duration-300 group ${!badge.earned ? 'opacity-60 grayscale' : 'hover:border-primary/50 hover:shadow-lg hover:-translate-y-1'
                                            }`}
                                    >
                                        <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                                            <div className={`p-4 rounded-2xl transition-transform duration-500 group-hover:scale-110 ${badge.earned ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                                                }`}>
                                                {badge.icon}
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex items-center justify-center gap-2">
                                                    <h3 className="font-bold text-foreground">{badge.name}</h3>
                                                    {badge.earned && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                                                    {badge.description}
                                                </p>
                                            </div>

                                            <UIBadge variant="outline" className={`uppercase text-[10px] font-black tracking-widest ${rarityColors[badge.rarity]}`}>
                                                {badge.rarity}
                                            </UIBadge>

                                            {badge.progress && !badge.earned && (
                                                <div className="w-full space-y-2 mt-4">
                                                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary rounded-full transition-all duration-1000"
                                                            style={{ width: `${(badge.progress.current / badge.progress.target) * 100}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-[10px] font-mono text-muted-foreground">
                                                        {badge.progress.current} / {badge.progress.target}
                                                    </p>
                                                </div>
                                            )}

                                            {!badge.earned && (
                                                <div className="absolute top-2 right-2">
                                                    <Lock className="w-4 h-4 text-muted-foreground/30" />
                                                </div>
                                            )}

                                            {badge.earned && badge.earnedAt && (
                                                <p className="text-[10px] text-muted-foreground mt-4">
                                                    Earned on {new Date(badge.earnedAt).toLocaleDateString()}
                                                </p>
                                            )}
                                        </CardContent>

                                        {badge.earned && (
                                            <div className="absolute inset-0 border-2 border-primary/20 pointer-events-none rounded-xl" />
                                        )}
                                    </Card>
                                ))}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}
