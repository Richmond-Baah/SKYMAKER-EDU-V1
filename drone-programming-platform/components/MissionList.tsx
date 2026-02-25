import React from 'react'
import missionsData from '@/data/missions.json'
import { Mission } from '@/types/mission'
import { MissionCard } from './MissionCard'

export function MissionList() {
  const missions: Mission[] = missionsData as Mission[]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {missions.map(m => (
        <MissionCard key={m.id} mission={m} />
      ))}
    </div>
  )
}
