"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useDroneStore } from '@/lib/store'

import { Mission } from '@/types/mission'


interface MissionDetailProps {
  mission: Mission
}

export function MissionDetailClient({ mission }: MissionDetailProps) {
  const router = useRouter()
  const { setLesson } = useDroneStore()

  function handleStart() {
    try {
      // Try to set lesson (works if mission id matches an existing lesson)
      setLesson(mission.id)
    } catch (e) {
      // noop
    }
    router.push('/')
  }

  return (
    <div className="space-y-6 bg-card p-8 rounded-2xl border border-border shadow-sm transition-colors duration-300">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <div className="text-[10px] font-mono text-muted-foreground mb-1 uppercase tracking-wider">{mission.id}</div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">{mission.title}</h2>
          <p className="text-base text-muted-foreground mt-4 leading-relaxed">{mission.objective}</p>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          <Badge className={`uppercase text-xs font-bold px-3 py-1 ${mission.tier === 'beginner' ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20' : 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20'}`}>
            {mission.tier} TRACK
          </Badge>
          <div className="text-sm font-bold text-muted-foreground/60 font-mono">{mission.estimatedTime || 15} MIN</div>
        </div>
      </div>

      {mission.starterCode && (
        <div className="bg-muted p-6 rounded-xl border border-border">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Starter Code Preview</h3>
          <pre className="whitespace-pre-wrap text-sm font-mono text-foreground/80 overflow-x-auto">
            {mission.starterCode}
          </pre>
        </div>
      )}

      <div className="flex items-center gap-4 pt-4 border-t border-border">
        <Button
          size="lg"
          onClick={handleStart}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95"
        >
          ▶ Start Mission
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => router.back()}
          className="border-border text-foreground hover:bg-muted"
        >
          Back
        </Button>
      </div>
    </div>
  )
}
