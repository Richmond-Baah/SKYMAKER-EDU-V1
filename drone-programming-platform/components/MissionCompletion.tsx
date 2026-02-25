"use client"

import React from 'react'
import { Lesson } from '@/lib/lessons'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trophy, ArrowRight, RotateCcw, Sparkles, CheckCircle2 } from 'lucide-react'

interface MissionCompletionProps {
    lesson: Lesson
    missionIndex: number
    score: number
    onNextMission: () => void
    onRetry: () => void
    hasNextMission: boolean
}

/**
 * Step 4 of the 4-step learning cycle.
 * Shows success animation, learning summary, and next steps.
 */
export function MissionCompletion({
    lesson,
    missionIndex,
    score,
    onNextMission,
    onRetry,
    hasNextMission,
}: MissionCompletionProps) {
    const stars = score >= 90 ? 3 : score >= 70 ? 2 : 1

    return (
        <div className="flex items-center justify-center min-h-full p-6 bg-background transition-colors duration-300">
            <div className="max-w-lg w-full space-y-8 animate-in fade-in zoom-in-95 duration-500">
                {/* Success Icon */}
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-[0_0_60px_rgba(16,185,129,0.4)] animate-pulse">
                            <Trophy className="w-12 h-12 text-white" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center shadow-lg">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                    </div>
                </div>

                {/* Title */}
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-black tracking-tight text-foreground">
                        Mission Complete!
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Module {missionIndex + 1}: {lesson.title}
                    </p>
                </div>

                {/* Stars */}
                <div className="flex justify-center gap-2">
                    {[1, 2, 3].map((star) => (
                        <span
                            key={star}
                            className={`text-3xl transition-all duration-300 ${star <= stars ? "text-yellow-400 scale-110" : "text-muted-foreground/10"
                                }`}
                            style={{ animationDelay: `${star * 200}ms` }}
                        >
                            ⭐
                        </span>
                    ))}
                </div>

                {/* Score */}
                <div className="text-center">
                    <span className="text-5xl font-black text-emerald-500 dark:text-emerald-400 tabular-nums">
                        {score}
                    </span>
                    <span className="text-muted-foreground/50 text-lg ml-1">/ 100</span>
                </div>

                {/* What You Learned */}
                {lesson.components.learningPoints &&
                    lesson.components.learningPoints.length > 0 && (
                        <div className="bg-card border border-border rounded-2xl p-6 space-y-3 shadow-sm">
                            <h3 className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">
                                What You Learned
                            </h3>
                            <ul className="space-y-2">
                                {lesson.components.learningPoints.map((point, i) => (
                                    <li
                                        key={i}
                                        className="flex items-start gap-2 text-sm text-foreground/70"
                                    >
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    {hasNextMission && (
                        <Button
                            size="lg"
                            onClick={onNextMission}
                            className="flex-1 w-full sm:w-auto h-12 gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all active:scale-95 border-none"
                        >
                            Next Mission
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={onRetry}
                        className="flex-1 w-full sm:w-auto h-12 gap-2 border-border text-foreground/80 hover:text-foreground hover:bg-muted transition-all"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Retry for ⭐⭐⭐
                    </Button>
                </div>
            </div>
        </div>
    )
}
