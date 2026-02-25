import React from 'react'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, Code, Share2, Trash2, Trophy, BarChart2 } from 'lucide-react'

export default async function PortfolioPage() {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Fetch favorite missions
    const { data: favorites } = await supabase
        .from('favorite_missions')
        .select('*')
        .eq('user_id', user.id)

    // Mock stats for visualization
    const codeStats = {
        totalLines: 1247,
        mostUsed: 'move_forward()',
        avgLength: 42,
        cleanest: 12
    }

    return (
        <div className="space-y-8 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Portfolio Content */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="space-y-4">
                        <div className="flex justify-between items-end">
                            <h3 className="text-xl font-bold text-foreground">Favorite Missions</h3>
                            <p className="text-sm text-muted-foreground">{favorites?.length || 0} / 5 Slots Used</p>
                        </div>

                        {favorites && favorites.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {favorites.map((fav) => (
                                    <Card key={fav.id} className="border-border bg-card shadow-sm hover:border-primary/50 transition-all overflow-hidden">
                                        <CardContent className="p-0">
                                            <div className="h-32 bg-muted flex items-center justify-center relative group">
                                                <Trophy className="w-12 h-12 text-muted-foreground/20 group-hover:scale-110 transition-transform" />
                                                <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                                    <Button size="icon" variant="secondary" className="rounded-full">
                                                        <Play className="w-4 h-4" />
                                                    </Button>
                                                    <Button size="icon" variant="secondary" className="rounded-full">
                                                        <Code className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="p-6 space-y-4">
                                                <div>
                                                    <h4 className="font-bold text-foreground">{fav.mission_id}</h4>
                                                    <p className="text-xs text-muted-foreground italic line-clamp-2">{fav.notes || "No notes added."}</p>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="font-black text-blue-500">{fav.score}% SCORE</span>
                                                    <div className="flex gap-2">
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                            <Share2 className="w-4 h-4" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-red-500">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="border-dashed border-2 py-20 bg-muted/30">
                                <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="p-4 bg-muted rounded-full">
                                        <Trophy className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-bold text-foreground">Your Showcase is Empty</p>
                                        <p className="text-sm text-muted-foreground max-w-[300px]">Complete missions and mark your favorite solutions to show them off here!</p>
                                    </div>
                                    <Button variant="outline" className="mt-4">Go to Missions</Button>
                                </CardContent>
                            </Card>
                        )}
                    </section>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-8">
                    <Card className="border-border bg-card shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart2 className="w-5 h-5 text-green-500" />
                                Code Statistics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between p-3 bg-muted/50 rounded-xl border border-border">
                                <span className="text-sm text-muted-foreground">Total Lines Written</span>
                                <span className="font-bold text-foreground">{codeStats.totalLines}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-muted/50 rounded-xl border border-border">
                                <span className="text-sm text-muted-foreground">Avg. Mission Length</span>
                                <span className="font-bold text-foreground">{codeStats.avgLength} lines</span>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-xl border border-border space-y-2">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Most Used Command</span>
                                <div className="flex justify-between items-center">
                                    <code className="text-blue-500 font-bold">{codeStats.mostUsed}</code>
                                    <span className="text-xs text-muted-foreground">42%</span>
                                </div>
                                <div className="h-1 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '42%' }} />
                                </div>
                            </div>
                            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center gap-4">
                                <Trophy className="w-8 h-8 text-yellow-500" />
                                <div>
                                    <p className="text-xs font-black text-yellow-600 uppercase">Clean Code Award</p>
                                    <p className="font-bold text-foreground">Mission 8: 12 Lines</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card shadow-sm overflow-hidden bg-gradient-to-br from-blue-600/10 to-purple-600/10">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Certificates</CardTitle>
                            <CardDescription>Earned upon course completion.</CardDescription>
                        </CardHeader>
                        <CardContent className="py-8 text-center space-y-4">
                            <div className="mx-auto w-16 h-16 bg-muted rounded-2xl rotate-3 flex items-center justify-center border-2 border-border shadow-soft">
                                <Trophy className="w-8 h-8 text-muted-foreground/30" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">Complete the Beginner Track to unlock your first certificate!</p>
                            <p className="text-[10px] font-bold text-primary uppercase">4 / 10 MISSIONS UNTIL GRADUATION</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
