import React from 'react'
import { MissionList } from '@/components/MissionList'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/navigation/BackButton'

export default function MissionsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-blue-500/30 transition-colors duration-300">
      <main className="container mx-auto py-12 px-6 relative z-10 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <BackButton />
            <div>
              <h1 className="text-4xl font-black tracking-tighter">Missions</h1>
              <p className="text-muted-foreground mt-2">Beginner missions — learn by doing with short, focused challenges.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="font-bold">Open Dashboard</Button>
            </Link>
          </div>
        </div>

        <section>
          <MissionList />
        </section>
      </main>
    </div>
  )
}
