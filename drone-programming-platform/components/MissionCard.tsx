"use client"

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Lock, CheckCircle } from 'lucide-react'

import { Mission } from '@/types/mission'
import { useDroneStore } from '@/lib/store'
import { beginnerLessons } from '@/lib/lessons'

/**
 * Maps mission_0X IDs from missions.json to the lesson IDs used in beginnerLessons.
 * This keeps the two data sources in sync.
 */
const missionToLessonMap: Record<string, string> = {
  mission_01: 'takeoff-101',
  mission_02: 'forward-motion',
  mission_03: 'climb-ext',
  mission_04: 'square-dance',
  mission_05: 'precision-hover',
  mission_06: 'back-to-base',
  mission_07: 'precision-landing',
  mission_08: 'figure-eight',
  mission_09: 'altitude-control',
  mission_10: 'stunt-pilot',
}

interface MissionCardProps {
  mission: Mission
}

export function MissionCard({ mission }: MissionCardProps) {
  const { completedLessons } = useDroneStore()

  // Resolve the lesson id for this mission card
  const lessonId = missionToLessonMap[mission.id] ?? mission.id
  const lessonDef = beginnerLessons.find(l => l.id === lessonId)

  // A mission is locked if any prerequisites are not completed,
  // EXCEPT for the very first mission which is always unlocked.
  const isLocked = lessonDef && lessonDef.id !== beginnerLessons[0].id
    ? lessonDef.prerequisites.some(p => !completedLessons.includes(p))
    : false

  const isCompleted = completedLessons.includes(lessonId)

  return (
    <Card className={`bg-card border-border transition-all shadow-sm ${isLocked ? 'opacity-60' : 'hover:border-blue-500/20 hover:scale-[1.01]'}`}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="text-[10px] font-mono text-muted-foreground mb-1 uppercase tracking-wider">{mission.id}</div>
            <h3 className="text-lg font-bold text-foreground leading-tight mb-2 flex items-center gap-2">
              {mission.title}
              {isLocked && <Lock className="w-4 h-4 text-muted-foreground/60" />}
              {isCompleted && <CheckCircle className="w-4 h-4 text-emerald-500" />}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{mission.objective}</p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-wider ${mission.tier === 'beginner' ? 'text-blue-500 border-blue-500/20 bg-blue-500/5' : 'text-purple-500 border-purple-500/20 bg-purple-500/5'}`}>
              {mission.tier}
            </Badge>
            <div className="text-[10px] text-muted-foreground/60 font-mono font-bold">{mission.estimatedTime || 15} MIN</div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pb-6">
        <div className="flex w-full items-center justify-between gap-3">
          <Link href={`/missions/${mission.id}`} className="flex-1 text-center">
            <Button variant="outline" size="sm" className="w-full text-xs font-bold border-border text-foreground hover:bg-muted">
              DETAILS
            </Button>
          </Link>

          {isLocked ? (
            <div className="flex-[2]">
              <Button size="sm" disabled className="w-full bg-muted text-muted-foreground text-xs font-bold shadow-none cursor-not-allowed">
                <Lock className="w-3.5 h-3.5 mr-2" />
                LOCKED
              </Button>
            </div>
          ) : (
            <Link href={`/learn?mission=${lessonId}`} className="flex-[2]">
              <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20">
                {isCompleted ? 'REPLAY MISSION' : 'START MISSION'}
              </Button>
            </Link>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
