
"use client"

import { useState } from "react";
import { useDroneStore } from "@/lib/store";
import { beginnerLessons } from "@/lib/lessons";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, CheckCircle, Crosshair, Target, Activity, Zap, Shield, Trophy, LayoutGrid, List } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function Dashboard() {
    const { completedLessons, metrics, setLesson } = useDroneStore();
    const router = useRouter();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

    const completionPercentage = (completedLessons.length / beginnerLessons.length) * 100;

    return (
        <div className="min-h-screen bg-[#050507] text-white selection:bg-blue-500/30">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/5 blur-[120px] rounded-full" />
                <div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] bg-purple-600/5 blur-[100px] rounded-full" />
            </div>

            <main className="container mx-auto py-12 px-6 relative z-10 space-y-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <Link href="/">
                            <Button variant="ghost" size="sm" className="group text-white/40 hover:text-white px-0 gap-2">
                                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                                RETURN TO FLIGHT DECK
                            </Button>
                        </Link>
                        <div className="space-y-2">
                            <h1 className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
                                PILOT LOGS
                            </h1>
                            <p className="text-white/40 font-mono text-sm uppercase tracking-widest flex items-center gap-2">
                                <Shield className="w-4 h-4 text-drone-blue" />
                                OPERATIONAL DATA & PERFORMANCE METRICS
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-2 rounded-2xl backdrop-blur-xl">
                        <div className="px-6 py-2 border-r border-white/10">
                            <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Global Rank</div>
                            <div className="text-xl font-bold text-blue-400">#1,248</div>
                        </div>
                        <div className="px-6 py-2">
                            <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Total XP</div>
                            <div className="text-xl font-bold text-emerald-400">{(completedLessons.length * 150).toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                {/* Performance Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <MetricCard
                        title="CURRICULUM"
                        value={`${completedLessons.length} / ${beginnerLessons.length}`}
                        subtitle={`${completionPercentage.toFixed(0)}% CERTIFIED`}
                        icon={<Trophy className="w-5 h-5 text-drone-gold" />}
                        progress={completionPercentage}
                        color="gold"
                    />
                    <MetricCard
                        title="ACCURACY"
                        value={`${(metrics.accuracy || 0).toFixed(1)}m`}
                        subtitle="PATH DEVIATION DELTA"
                        icon={<Crosshair className="w-5 h-5 text-drone-cyan" />}
                        color="cyan"
                    />
                    <MetricCard
                        title="STABILITY"
                        value={(metrics.stability || 0).toFixed(1)}
                        subtitle="GYRO-STABLE INDEX"
                        icon={<Zap className="w-5 h-5 text-drone-emerald" />}
                        color="emerald"
                    />
                    <MetricCard
                        title="CURRENT RANK"
                        value="CADET"
                        subtitle="NEXT: FLIGHT OFFICER"
                        icon={<Activity className="w-5 h-5 text-blue-500" />}
                        color="blue"
                    />
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Training Log Table */}
                    <Card className="lg:col-span-2 glass-dark border-white/5 shadow-2xl overflow-hidden rounded-3xl">
                        <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl font-bold tracking-tight">Mission History</CardTitle>
                                <CardDescription className="text-white/40">Real-time status of all curriculum modules</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className={`h-8 w-8 rounded-lg border-white/10 transition-all ${viewMode === 'grid' ? 'text-white bg-white/10' : 'text-white/40'}`}
                                    onClick={() => setViewMode('grid')}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className={`h-8 w-8 rounded-lg border-white/10 transition-all ${viewMode === 'list' ? 'text-white bg-white/10' : 'text-white/40'}`}
                                    onClick={() => setViewMode('list')}
                                >
                                    <List className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {viewMode === 'list' ? (
                                <Table>
                                    <TableHeader className="bg-white/[0.02]">
                                        <TableRow className="hover:bg-transparent border-white/5">
                                            <TableHead className="w-[120px] pl-8 text-[10px] font-black uppercase tracking-widest text-white/40">Module ID</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-white/40">Objective</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-white/40 text-center">Status</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-white/40">Tier</TableHead>
                                            <TableHead className="text-right pr-8 text-[10px] font-black uppercase tracking-widest text-white/40">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {beginnerLessons.map(lesson => {
                                            const isCompleted = completedLessons.includes(lesson.id);
                                            const isLocked = lesson.prerequisites.some(p => !completedLessons.includes(p)) && lesson.id !== beginnerLessons[0].id;
                                            return (
                                                <TableRow key={lesson.id} className={`border-white/5 hover:bg-white/[0.02] transition-colors group ${isLocked ? 'opacity-50 grayscale' : ''}`}>
                                                    <TableCell className="font-mono text-[10px] pl-8 text-white/40">{lesson.id.toUpperCase()}</TableCell>
                                                    <TableCell className="font-bold text-sm tracking-tight">{lesson.title}</TableCell>
                                                    <TableCell className="text-center">
                                                        {isCompleted ? (
                                                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1 font-black text-[9px] tracking-tighter uppercase whitespace-nowrap">
                                                                PASSED
                                                            </Badge>
                                                        ) : isLocked ? (
                                                            <Badge variant="outline" className="text-white/10 border-white/5 px-3 py-1 font-black text-[9px] tracking-tighter uppercase whitespace-nowrap">
                                                                <Shield className="w-3 h-3 mr-1" /> LOCKED
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-white/20 border-white/10 px-3 py-1 font-black text-[9px] tracking-tighter uppercase whitespace-nowrap">
                                                                PENDING
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${lesson.tier === 'beginner' ? 'text-blue-400' : 'text-purple-400'}`}>
                                                            {lesson.tier}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right pr-8">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            disabled={isLocked}
                                                            className={`h-8 text-xs font-bold ${isLocked ? 'text-white/20' : 'text-blue-400 hover:text-white hover:bg-blue-600'}`}
                                                            onClick={() => {
                                                                setLesson(lesson.id);
                                                                router.push("/");
                                                            }}
                                                        >
                                                            {isCompleted ? "REVISIT" : isLocked ? "ENCRYPTED" : "INITIATE"}
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {beginnerLessons.map(lesson => {
                                        const isCompleted = completedLessons.includes(lesson.id);
                                        const isLocked = lesson.prerequisites.some(p => !completedLessons.includes(p)) && lesson.id !== beginnerLessons[0].id;
                                        return (
                                            <Card key={lesson.id} className={`bg-white/5 border-white/10 hover:border-white/20 transition-all group overflow-hidden ${isLocked ? 'opacity-50 grayscale' : ''}`}>
                                                <div className="p-4 flex flex-col h-full justify-between gap-4">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="text-[10px] font-mono text-white/40 mb-1">{lesson.id.toUpperCase()}</div>
                                                            <div className="font-bold text-lg leading-tight">{lesson.title}</div>
                                                        </div>
                                                        {isCompleted ? (
                                                            <div className="p-1 px-2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                                                                <CheckCircle className="w-3 h-3" /> PASSED
                                                            </div>
                                                        ) : isLocked ? (
                                                            <div className="p-1 px-2 rounded bg-white/5 text-white/20 border border-white/10 text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                                                                <Shield className="w-3 h-3" /> LOCKED
                                                            </div>
                                                        ) : (
                                                            <div className="p-1 px-2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                                                                <Activity className="w-3 h-3 animate-pulse" /> PENDING
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${lesson.tier === 'beginner' ? 'text-blue-400' : 'text-purple-400'}`}>
                                                            {lesson.tier}
                                                        </span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            disabled={isLocked}
                                                            className={`h-8 font-bold text-[10px] tracking-widest ${isLocked ? 'text-white/20' : 'text-blue-400 hover:text-white hover:bg-blue-600'}`}
                                                            onClick={() => {
                                                                setLesson(lesson.id);
                                                                router.push("/");
                                                            }}
                                                        >
                                                            {isCompleted ? "REVISIT" : isLocked ? "ENCRYPTED" : "INITIATE"}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Card>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Side Info Panel */}
                    <div className="space-y-6">
                        <Card className="glass border-white/5 bg-blue-600/10 shadow-2xl rounded-3xl p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Shield className="w-24 h-24" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Next Milestone</h3>
                            <p className="text-sm text-white/60 mb-6 leading-relaxed">
                                Complete 2 more modules with accuracy {'>'} 80% to unlock the Advanced Flight Certificate.
                            </p>
                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-500 font-bold shadow-xl shadow-blue-500/20 py-6 text-sm tracking-widest"
                                onClick={() => toast.info("Advanced certification track is currently under development.")}
                            >
                                EXPLORE CERTIFICATION
                            </Button>
                        </Card>

                        <Card className="glass-dark border-white/5 rounded-3xl p-6">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/40 mb-6">Recent Activity</h3>
                            <div className="space-y-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex gap-4 items-start border-l-2 border-white/5 pl-4 ml-1">
                                        <div className="shrink-0 pt-1">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold">Mission Executed: Takeoff</p>
                                            <p className="text-[10px] text-white/40 uppercase tracking-tighter mt-1">2 HOURS AGO • SIMULATION MODE</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}

function MetricCard({ title, value, subtitle, icon, progress, color }: any) {
    const colorClasses: any = {
        gold: "text-drone-gold border-drone-gold/20",
        cyan: "text-drone-cyan border-drone-cyan/20",
        emerald: "text-drone-emerald border-drone-emerald/20",
        blue: "text-blue-400 border-blue-400/20"
    };

    return (
        <Card className="glass border-white/5 bg-transparent shadow-xl rounded-3xl overflow-hidden group hover:scale-[1.02] transition-all duration-300">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{title}</CardTitle>
                <div className={`p-2 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors`}>
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-black tracking-tighter mb-1">{value}</div>
                <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{subtitle}</div>

                {progress !== undefined && (
                    <div className="mt-6 space-y-2">
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.3)] transition-all duration-1000"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

