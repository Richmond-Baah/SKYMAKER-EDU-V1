"use client"

import { useState } from "react";
import { useDroneStore } from "@/lib/store";
import { beginnerLessons } from "@/lib/lessons";
import { getAssignment } from "@/lib/assignments";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, CheckCircle, Crosshair, Target, Activity, Zap, Shield, Trophy, LayoutGrid, List } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SubmissionPanel } from "@/components/SubmissionPanel";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { AuthButton } from "@/components/AuthButton";
import { BackButton } from "@/components/navigation/BackButton";
import { StudentResults } from "@/components/StudentResults";

export default function Dashboard() {
    const { completedLessons, metrics, setLesson, redeemAssignment } = useDroneStore();
    const role = useDroneStore(state => state.role);
    const router = useRouter();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [assignmentCode, setAssignmentCode] = useState('')

    async function handleRedeem() {
        const code = assignmentCode.trim();
        if (!code) {
            toast.error('Enter assignment code');
            return;
        }

        // try server first, then fall back to localStorage
        let assignment: any | undefined = undefined;
        try {
            const res = await fetch(`/api/assignments/${encodeURIComponent(code)}`);
            if (res.ok) {
                assignment = await res.json();
            }
        } catch (err) {
            // network error or server unreachable — we'll fall back to local storage below
            assignment = undefined;
        }

        // fallback to client-side assignments stored in localStorage
        if (!assignment) {
            assignment = getAssignment(code);
        }

        if (!assignment) {
            toast.error('Invalid assignment code');
            return;
        }

        redeemAssignment(assignment.missions);
        const desc = assignment.description ? `: ${assignment.description}` : '';
        toast.success(`Assignment added to your missions${desc}`);
        setAssignmentCode('');
    }

    const completionPercentage = (completedLessons.length / beginnerLessons.length) * 100;

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-blue-500/30 transition-colors duration-300">
            {/* Ambient Background - adjust opacity for light mode via dark: prefix if needed, currently reusing same classes */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/5 blur-[120px] rounded-full" />
                <div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] bg-purple-600/5 blur-[100px] rounded-full" />
            </div>

            <main className="container mx-auto py-12 px-6 relative z-10 space-y-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <BackButton label="RETURN TO FLIGHT DECK" />
                        <div className="space-y-2">
                            <h1 className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/40 flex items-center gap-4">
                                PILOT LOGS
                                {role === 'teacher' && (
                                    <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest h-fit">
                                        TEACHER VIEW
                                    </Badge>
                                )}
                            </h1>
                            <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest flex items-center gap-2">
                                <Shield className="w-4 h-4 text-drone-blue" />
                                OPERATIONAL DATA & PERFORMANCE METRICS
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-4 bg-card border border-border p-2 rounded-2xl shadow-sm">
                            <div className="px-6 py-2 border-r border-border">
                                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Global Rank</div>
                                <div className="text-xl font-bold text-blue-500">#1,248</div>
                            </div>
                            <div className="px-6 py-2 border-r border-border">
                                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Total XP</div>
                                <div className="text-xl font-bold text-emerald-500">{(completedLessons.length * 150).toLocaleString()}</div>
                            </div>
                            {role !== 'teacher' && (
                                <div className="px-4 py-2 flex items-center gap-2">
                                    <input
                                        aria-label="Redeem assignment code"
                                        className="bg-muted border border-border rounded px-2 py-1 text-sm w-36 text-foreground placeholder-muted-foreground"
                                        placeholder="Redeem code"
                                        value={assignmentCode}
                                        onChange={(e) => setAssignmentCode(e.target.value)}
                                    />
                                    <Button size="sm" onClick={handleRedeem}>Redeem</Button>
                                </div>
                            )}
                            {role === 'teacher' && (
                                <div className="px-2 border-l border-border">
                                    <Link href="/classroom">
                                        <Button
                                            size="sm"
                                            className="bg-purple-600 hover:bg-purple-500 text-white font-bold h-9 px-4 rounded-xl shadow-lg shadow-purple-500/20 transition-all hover:scale-105 active:scale-95"
                                        >
                                            TEACHER DASHBOARD
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                        <div className="bg-card border border-border p-2 rounded-2xl shadow-sm h-full flex items-center justify-center aspect-square">
                            <AuthButton />
                        </div>
                    </div>
                </div>

                {/* Performance Grid - Only for Students */}
                {role !== 'teacher' && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <MetricCard
                            title="CURRICULUM"
                            value={`${completedLessons.length} / ${beginnerLessons.length}`}
                            subtitle={`${completionPercentage.toFixed(0)}% CERTIFIED`}
                            icon={<Trophy className="w-5 h-5 text-amber-500" />}
                            progress={completionPercentage}
                            color="amber"
                        />
                        <MetricCard
                            title="ACCURACY"
                            value={`${(metrics.accuracy || 0).toFixed(1)}m`}
                            subtitle="PATH DEVIATION DELTA"
                            icon={<Crosshair className="w-5 h-5 text-cyan-500" />}
                            color="cyan"
                        />
                        <MetricCard
                            title="STABILITY"
                            value={(metrics.stability || 0).toFixed(1)}
                            subtitle="GYRO-STABLE INDEX"
                            icon={<Zap className="w-5 h-5 text-emerald-500" />}
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
                )}

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Training Log Table */}
                    <Card className="lg:col-span-2 bg-card border-border shadow-xl overflow-hidden rounded-3xl">
                        <CardHeader className="p-8 border-b border-border flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Mission History</CardTitle>
                                <CardDescription className="text-muted-foreground">Real-time status of all curriculum modules</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className={`h-8 w-8 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
                                    onClick={() => setViewMode('grid')}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className={`h-8 w-8 rounded-lg transition-all ${viewMode === 'list' ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
                                    onClick={() => setViewMode('list')}
                                >
                                    <List className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {viewMode === 'list' ? (
                                <Table>
                                    <TableHeader className="bg-muted/30">
                                        <TableRow className="hover:bg-transparent border-border">
                                            <TableHead className="w-[120px] pl-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Module ID</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Objective</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Status</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tier</TableHead>
                                            <TableHead className="text-right pr-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {beginnerLessons.map(lesson => {
                                            const isCompleted = completedLessons.includes(lesson.id);
                                            const isLocked = lesson.prerequisites.some(p => !completedLessons.includes(p)) && lesson.id !== beginnerLessons[0].id;
                                            return (
                                                <TableRow key={lesson.id} className={`border-border hover:bg-muted/20 transition-colors group ${isLocked ? 'opacity-50 grayscale' : ''}`}>
                                                    <TableCell className="font-mono text-[10px] pl-8 text-muted-foreground">{lesson.id.toUpperCase()}</TableCell>
                                                    <TableCell className="font-bold text-sm tracking-tight text-foreground">{lesson.title}</TableCell>
                                                    <TableCell className="text-center">
                                                        {isCompleted ? (
                                                            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-3 py-1 font-black text-[9px] tracking-tighter uppercase whitespace-nowrap">
                                                                PASSED
                                                            </Badge>
                                                        ) : isLocked ? (
                                                            <Badge variant="outline" className="text-muted-foreground/50 border-border px-3 py-1 font-black text-[9px] tracking-tighter uppercase whitespace-nowrap">
                                                                <Shield className="w-3 h-3 mr-1" /> LOCKED
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-muted-foreground border-border px-3 py-1 font-black text-[9px] tracking-tighter uppercase whitespace-nowrap">
                                                                PENDING
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${lesson.tier === 'beginner' ? 'text-blue-500' : 'text-purple-500'}`}>
                                                            {lesson.tier}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right pr-8">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            disabled={isLocked}
                                                            className={`h-8 text-xs font-bold ${isLocked ? 'text-muted-foreground/50' : 'text-blue-500 hover:text-white hover:bg-blue-600'}`}
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
                                            <Card key={lesson.id} className={`bg-card border-border hover:border-sidebar-accent transition-all group overflow-hidden ${isLocked ? 'opacity-50 grayscale' : ''}`}>
                                                <div className="p-4 flex flex-col h-full justify-between gap-4">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="text-[10px] font-mono text-muted-foreground mb-1">{lesson.id.toUpperCase()}</div>
                                                            <div className="font-bold text-lg leading-tight text-foreground">{lesson.title}</div>
                                                        </div>
                                                        {isCompleted ? (
                                                            <div className="p-1 px-2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                                                                <CheckCircle className="w-3 h-3" /> PASSED
                                                            </div>
                                                        ) : isLocked ? (
                                                            <div className="p-1 px-2 rounded bg-muted text-muted-foreground/50 border border-border text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                                                                <Shield className="w-3 h-3" /> LOCKED
                                                            </div>
                                                        ) : (
                                                            <div className="p-1 px-2 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                                                                <Activity className="w-3 h-3 animate-pulse" /> PENDING
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${lesson.tier === 'beginner' ? 'text-blue-500' : 'text-purple-500'}`}>
                                                            {lesson.tier}
                                                        </span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            disabled={isLocked}
                                                            className={`h-8 font-bold text-[10px] tracking-widest ${isLocked ? 'text-muted-foreground/50' : 'text-blue-500 hover:text-white hover:bg-blue-600'}`}
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

                    {/* Side Info Panel - Hide for Teachers */}
                    {role !== 'teacher' && (
                        <div className="space-y-6">
                            <Card className="bg-card border-border shadow-2xl rounded-3xl p-6 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Shield className="w-24 h-24 text-foreground" />
                                </div>
                                <h3 className="text-lg font-bold mb-2 text-foreground">Next Milestone</h3>
                                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                                    Complete 2 more modules with accuracy {'>'} 80% to unlock the Advanced Flight Certificate.
                                </p>
                                <Button
                                    className="w-full bg-blue-600 hover:bg-blue-500 font-bold shadow-xl shadow-blue-500/20 py-6 text-sm tracking-widest text-white"
                                    onClick={() => toast.info("Advanced certification track is currently under development.")}
                                >
                                    EXPLORE CERTIFICATION
                                </Button>
                            </Card>

                            <Card className="bg-card border-border rounded-3xl p-6 shadow-sm">
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">Recent Activity</h3>
                                <div className="space-y-6">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex gap-4 items-start border-l-2 border-border pl-4 ml-1">
                                            <div className="shrink-0 pt-1">
                                                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-foreground">Mission Executed: Takeoff</p>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-tighter mt-1">2 HOURS AGO • SIMULATION MODE</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    )}
                </div>

                {/* Student Results - Shows grades/feedback from submitted assignments */}
                {role !== 'teacher' && (
                    <div className="mt-12">
                        <StudentResults />
                    </div>
                )}

                {/* Code Submission Panel - Only for Students */}
                {role !== 'teacher' && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold mb-6 tracking-tight text-foreground">Assignment Submission</h2>
                        <SubmissionPanel />
                    </div>
                )}
            </main>
        </div>
    )
}

interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle: string;
    icon: ReactNode;
    progress?: number;
    color: string;
}

function MetricCard({ title, value, subtitle, icon, progress, color }: MetricCardProps): JSX.Element {
    return (
        <Card className="bg-card border-border shadow-xl rounded-3xl overflow-hidden group hover:scale-[1.02] transition-all duration-300">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{title}</CardTitle>
                <div className={`p-2 rounded-xl bg-muted border border-border group-hover:bg-muted/80 transition-colors`}>
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-black tracking-tighter mb-1 text-foreground">{value}</div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{subtitle}</div>

                {progress !== undefined && (
                    <div className="mt-6 space-y-2">
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
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
