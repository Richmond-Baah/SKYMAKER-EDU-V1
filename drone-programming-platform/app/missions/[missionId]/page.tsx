import React from 'react'
import missionsData from '@/data/missions.json'
import { notFound } from 'next/navigation'
import { Mission } from '@/types/mission'
import { MissionDetailClient } from '@/components/MissionDetail'

interface Params {
  params: { missionId: string }
}

export default function MissionDetailPage({ params }: Params) {
  const missionId = params.missionId
  const mission = (missionsData as Mission[]).find(m => m.id === missionId)

  if (!mission) return notFound()

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 py-12">
      <main className="container mx-auto px-6">
        <MissionDetailClient mission={mission} />
      </main>
    </div>
  )
}
