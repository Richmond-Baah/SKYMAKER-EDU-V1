"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'

interface Entry { id: string; name: string; score: number; optedIn?: boolean }

const SAMPLE: Entry[] = [
  { id: 'u1', name: 'Amina', score: 920 },
  { id: 'u2', name: 'Kwame', score: 880 },
  { id: 'u3', name: 'Zanele', score: 740 },
]

export function Leaderboard() {
  const [entries, setEntries] = useState<Entry[]>(SAMPLE)
  const [showAnon, setShowAnon] = useState(false)

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('skymakers:leaderboard-optin') : null
    setShowAnon(stored === 'true')
  }, [])

  function toggleAnon() {
    const next = !showAnon
    setShowAnon(next)
    if (typeof window !== 'undefined') localStorage.setItem('skymakers:leaderboard-optin', String(next))
  }

  return (
    <Card>
      <CardHeader className="px-6 py-4">
        <CardTitle>Class Leaderboard</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-white/60">Top performers (opt‑in)</div>
          <Button size="sm" variant="outline" onClick={toggleAnon}>{showAnon ? 'Anonymous' : 'Named'}</Button>
        </div>

        <div className="space-y-2">
          {entries.map((e, idx) => (
            <div key={e.id} className="flex items-center justify-between p-3 bg-white/3 rounded">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center font-bold">{idx + 1}</div>
                <div>
                  <div className="font-bold">{showAnon ? `Student #${idx + 1}` : e.name}</div>
                  <div className="text-xs text-white/40">Score: {e.score}</div>
                </div>
              </div>
              <div className="text-sm text-white/60">XP {Math.round(e.score / 10)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
