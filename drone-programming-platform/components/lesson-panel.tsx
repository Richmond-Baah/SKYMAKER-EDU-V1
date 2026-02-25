"use client"

import { useDroneStore } from "@/lib/store";
import { beginnerLessons } from "@/lib/lessons";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, Lock, PlayCircle, BookOpen, AlertTriangle, ChevronRight, GraduationCap, Target, Activity, Crosshair } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CommandLibrary } from "./command-library";

export function LessonPanel() {
    const { currentLessonId, completedLessons, setLesson } = useDroneStore();

    const currentLesson = beginnerLessons.find(l => l.id === currentLessonId) || beginnerLessons[0];
    const currentIndex = beginnerLessons.findIndex(l => l.id === currentLesson.id);

    return (
        <div className="flex flex-col h-full bg-background border-l border-border dark:premium-gradient-bg transition-colors duration-300">
            {/* Current Lesson Header */}
            <div className="p-6 border-b border-border space-y-4">
                <div className="flex items-center justify-between">
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/20 px-3 py-1 text-[10px] uppercase tracking-widest font-bold">
                        {currentLesson.tier} TRACK
                    </Badge>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-tighter">
                        Module {currentIndex + 1} / {beginnerLessons.length}
                    </span>
                </div>
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
                        <GraduationCap className="w-6 h-6 text-blue-500" />
                        {currentLesson.title}
                    </h2>
                    <div className="h-1 w-20 bg-blue-600 rounded-full" />
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-6 space-y-8">
                    {/* Theory Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-foreground/90 font-bold text-sm uppercase tracking-wider">
                            <BookOpen className="w-4 h-4 text-blue-500 dark:text-drone-blue" />
                            <h3>Concept Briefing</h3>
                        </div>
                        <div className="text-sm text-muted-foreground leading-relaxed bg-card border border-border p-5 rounded-xl shadow-sm">
                            {currentLesson.components.theory}
                        </div>
                    </div>

                    {/* Objectives */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-foreground/90 font-bold text-sm uppercase tracking-wider">
                            <Target className="w-4 h-4 text-emerald-500 dark:text-drone-emerald" />
                            <h3>Mission Parameters</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border-l-2 border-l-blue-500/50">
                                <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                </div>
                                <p className="text-xs text-foreground/70 italic">Implement flight sequence via editor</p>
                            </div>

                            {currentLesson.components.successCriteria.timeLimit && (
                                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border-l-2 border-l-amber-500/50">
                                    <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                        <Activity className="w-3 h-3 text-amber-500" />
                                    </div>
                                    <p className="text-xs text-foreground/70 italic">Complete mission within {currentLesson.components.successCriteria.timeLimit}s</p>
                                </div>
                            )}

                            {currentLesson.components.successCriteria.positionAccuracy && (
                                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border-l-2 border-l-cyan-500/50">
                                    <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                        <Crosshair className="w-3 h-3 text-cyan-500" />
                                    </div>
                                    <p className="text-xs text-foreground/70 italic">Accuracy threshold: ±{currentLesson.components.successCriteria.positionAccuracy}m</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Command Library Section */}
                    <CommandLibrary />

                    <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex gap-4 transition-all hover:bg-amber-500/10">
                        <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-amber-500 uppercase tracking-tighter">Pilot Advisory</p>
                            <p className="text-[11px] text-muted-foreground leading-tight">
                                Ensure all commands are awaited. Flying in simulation first is recommended for safety.
                            </p>
                        </div>
                    </div>
                </div>
            </ScrollArea>

            {/* Lesson Navigation */}
            <div className="p-6 border-t border-border bg-background/80 dark:bg-black/40 backdrop-blur-3xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Training Progress</h3>
                    <span className="text-[10px] text-blue-500 dark:text-blue-400 font-bold">{Math.round((completedLessons.length / beginnerLessons.length) * 100)}%</span>
                </div>
                <div className="h-48 pr-3 overflow-y-auto custom-scrollbar">
                    <div className="space-y-2">
                        {beginnerLessons.map((lesson, idx) => {
                            const isLockedByPrereq = lesson.prerequisites.some(p => !completedLessons.includes(p));
                            const isLocked = isLockedByPrereq && lesson.id !== beginnerLessons[0].id;
                            const isCompleted = completedLessons.includes(lesson.id);
                            const isActive = lesson.id === currentLessonId;

                            return (
                                <Button
                                    key={lesson.id}
                                    variant="ghost"
                                    className={`w-full justify-start gap-4 h-auto py-3 px-4 rounded-xl transition-all duration-300 group ${isActive ? 'bg-blue-500/10 border border-blue-500/20 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                                    disabled={isLocked}
                                    onClick={() => setLesson(lesson.id)}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 ${isCompleted ? 'bg-emerald-500/20 text-emerald-500' : isLocked ? 'bg-muted text-muted-foreground/50' : isActive ? 'bg-blue-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                                        {isCompleted ? <CheckCircle className="w-5 h-5 animate-pulse" /> : isLocked ? <Lock className="w-5 h-5" /> : <PlayCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                                    </div>

                                    <div className="flex-1 text-left">
                                        <div className="text-xs font-bold tracking-tight mb-0.5">{lesson.title}</div>
                                        <div className="text-[10px] opacity-60 font-mono">Mission 0{idx + 1}</div>
                                    </div>
                                    {isActive && <ChevronRight className="w-4 h-4 text-blue-500" />}
                                </Button>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
