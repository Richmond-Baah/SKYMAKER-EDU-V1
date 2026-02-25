"use client"

import React from 'react'
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface SkillRadarChartProps {
    skills: {
        control: number;
        stability: number;
        logic: number;
        efficiency: number;
        creativity: number;
        debugging: number;
        planning: number;
        execution: number;
    }
}

export function SkillRadarChart({ skills }: SkillRadarChartProps) {
    const data = [
        { subject: 'Control', A: skills.control, fullMark: 100 },
        { subject: 'Stability', A: skills.stability, fullMark: 100 },
        { subject: 'Logic', A: skills.logic, fullMark: 100 },
        { subject: 'Efficiency', A: skills.efficiency, fullMark: 100 },
        { subject: 'Creativity', A: skills.creativity, fullMark: 100 },
        { subject: 'Debugging', A: skills.debugging, fullMark: 100 },
        { subject: 'Planning', A: skills.planning, fullMark: 100 },
        { subject: 'Execution', A: skills.execution, fullMark: 100 },
    ]

    return (
        <Card className="border-border bg-card shadow-sm overflow-hidden min-h-[400px]">
            <CardHeader>
                <CardTitle className="text-xl font-bold">Skill Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center p-0">
                <div className="w-full h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                            <PolarGrid stroke="hsla(var(--border))" />
                            <PolarAngleAxis
                                dataKey="subject"
                                tick={{ fill: 'hsla(var(--foreground))', fontSize: 10, fontWeight: 700 }}
                            />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} axisLine={false} tick={false} />
                            <Radar
                                name="Skills"
                                dataKey="A"
                                stroke="#3b82f6"
                                fill="#3b82f6"
                                fillOpacity={0.6}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
