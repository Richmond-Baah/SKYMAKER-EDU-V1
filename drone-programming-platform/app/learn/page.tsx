"use client"

import { Suspense } from "react"
import { LearningPlatform } from "@/components/learning-platform"

export default function Page() {
    return (
        <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center bg-background text-foreground">Loading flight systems...</div>}>
            <LearningPlatform />
        </Suspense>
    )
}
