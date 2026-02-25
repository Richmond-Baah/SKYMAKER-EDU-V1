"use client"

import React from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Lock } from 'lucide-react'

import { Mission } from '@/types/mission'
import { useDroneStore } from '@/lib/store'
import { beginnerLessons } from '@/lib/lessons'

interface MissionCardProps {
  mission: Mission
}

export function MissionCard({ mission }: MissionCardProps) {
  const { completedLessons } = useDroneStore()

  // Find the corresponding lesson to get prerequisites
  const lessonDef = beginnerLessons.find(l => l.id === mission.id)

  // A mission is locked if any of its prerequisites are not in completedLessons,
  // EXCEPT for the very first mission (takeoff-101) which is always unlocked.
  const isLocked = lessonDef && lessonDef.id !== beginnerLessons[0].id
    ? lessonDef.prerequisites.some(p => !completedLessons.includes(p))
    : false

  return (
    <Card className="bg-card border-border hover:border-blue-500/20 transition-all hover:scale-[1.01] shadow-sm">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="text-[10px] font-mono text-muted-foreground mb-1 uppercase tracking-wider">{mission.id}</div>
            <h3 className="text-lg font-bold text-foreground leading-tight mb-2 flex items-center gap-2">
              {mission.title}
              {isLocked && <Lock className="w-4 h-4 text-muted-foreground/60" />}
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
              <Button size="sm" disabled className="w-full bg-muted text-muted-foreground text-xs font-bold shadow-none">
                <Lock className="w-3.5 h-3.5 mr-2" />
                LOCKED
              </Button>
            </div>
          ) : (
            <Link href={`/learn?mission=${mission.id}`} className="flex-[2]">
              <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20">
                START MISSION
              </Button>
            </Link>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
