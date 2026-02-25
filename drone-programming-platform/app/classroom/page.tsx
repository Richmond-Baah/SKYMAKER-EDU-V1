"use client"

import React from 'react'
import { useDroneStore } from '@/lib/store'
import { TeacherDashboard } from '@/components/TeacherDashboard'
import { BackButton } from '@/components/navigation/BackButton'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ClassroomPage() {
  const role = useDroneStore(state => state.role)
  const user = useDroneStore(state => state.user)
  const router = useRouter()

  // Redirect non-teachers away from the classroom
  useEffect(() => {
    if (role !== null && role !== 'teacher') {
      router.replace('/dashboard')
    }
  }, [role, router])

  // Show loading while role is being determined
  if (!user || role === null) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">
          Verifying access...
        </p>
      </div>
    )
  }

  if (role !== 'teacher') {
    return null // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-blue-500/30 transition-colors duration-300">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] bg-emerald-600/5 blur-[100px] rounded-full" />
      </div>

      <main className="container mx-auto py-12 px-6 relative z-10 w-full">
        <div className="mb-8">
          <BackButton label="RETURN TO PILOT LOGS" />
        </div>
        <TeacherDashboard />
      </main>
    </div>
  )
}
