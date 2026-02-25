"use client"

import React from 'react'
import { Lesson } from '@/lib/lessons'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Rocket, Target } from 'lucide-react'

interface MissionIntroProps {
    lesson: Lesson
    missionIndex: number
    totalMissions: number
    onStart: () => void
}

/**
 * Step 1 of the 4-step learning cycle.
 * Displays the mission objective, theory briefing, and a prominent Start button.
 */
export function MissionIntro({ lesson, missionIndex, onStart }: MissionIntroProps) {
    return (
        <div className="flex items-center justify-center min-h-full p-6 bg-background transition-colors duration-300">
            <div className="max-w-2xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header */}
                <div className="text-center space-y-3">
                    <Badge
                        variant="outline"
                        className="bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/20 px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] font-bold"
                    >
                        Mission {missionIndex + 1}
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                        {lesson.title}
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                        {lesson.components.theory}
                    </p>
                </div>

                {/* Objective Card */}
                <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
                    <div className="flex items-center gap-2 text-foreground/80 font-bold text-sm uppercase tracking-widest">
                        <Target className="w-4 h-4 text-blue-500" />
                        <span>Mission Objective</span>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed pl-6">
                        {lesson.components.theory}
                    </p>

                    {/* Success Criteria Badges */}
                    <div className="flex flex-wrap gap-2 pl-6 pt-2">
                        {lesson.components.successCriteria.altitude && (
                            <Badge variant="outline" className="bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]">
                                Min Altitude: {lesson.components.successCriteria.altitude}m
                            </Badge>
                        )}
                        {lesson.components.successCriteria.distance && (
                            <Badge variant="outline" className="bg-blue-500/5 text-blue-600 dark:text-blue-400 border-blue-500/20 text-[10px]">
                                Min Distance: {lesson.components.successCriteria.distance}m
                            </Badge>
                        )}
                        {lesson.components.successCriteria.positionAccuracy && (
                            <Badge variant="outline" className="bg-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px]">
                                Accuracy: ±{lesson.components.successCriteria.positionAccuracy}m
                            </Badge>
                        )}
                        {lesson.components.successCriteria.landed && (
                            <Badge variant="outline" className="bg-cyan-500/5 text-cyan-600 dark:text-cyan-400 border-cyan-500/20 text-[10px]">
                                Must Land Safely
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Start Button */}
                <div className="flex items-center justify-center pt-4">
                    <Button
                        size="lg"
                        onClick={onStart}
                        className="h-14 px-12 gap-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-base shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_40px_rgba(37,99,235,0.6)] transition-all duration-300 active:scale-95 rounded-xl border-none"
                    >
                        <Rocket className="w-5 h-5" />
                        Start Mission
                    </Button>
                </div>

                {/* Quick tip */}
                <div className="text-center">
                    <p className="text-[10px] text-muted-foreground/60 uppercase tracking-[0.15em] font-bold">
                        Press Ctrl+Enter to run your code  •  Ctrl+K for command reference
                    </p>
                </div>
            </div>
        </div>
    )
}
