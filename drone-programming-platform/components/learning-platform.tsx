"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { LessonPanel } from "@/components/lesson-panel"
import { SimulationCanvas } from "@/components/simulation-canvas"
import PythonEditor from "@/components/python-editor"
import { MissionIntro } from "@/components/MissionIntro"
import { MissionCompletion } from "@/components/MissionCompletion"
import { useDroneStore } from "@/lib/store"
import { beginnerLessons } from "@/lib/lessons"
import { Button } from "@/components/ui/button"
import {
    LayoutDashboard,
    Cpu,
    Maximize,
    Bell,
    GraduationCap,
    Sun,
    Moon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { CommandGuide } from "@/components/command-guide"
import { BackButton } from "@/components/navigation/BackButton"
import { useDroneLink } from "@/hooks/use-drone-link"
import type { MissionState } from "@/types/mission"
import { AuthButton } from "@/components/AuthButton"

export function LearningPlatform() {
    const { currentLessonId, code: templateCode, completedLessons, setLesson } =
        useDroneStore()
    const { isConnected } = useDroneLink()
    const { resolvedTheme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // Mission flow state
    const [missionState, setMissionState] = useState<MissionState>("intro")
    const [lastScore, setLastScore] = useState(0)

    // Simulation state bridging Editor ↔ Visualizer
    const [simState, setSimState] = useState({ x: 0, y: 0, z: 0, yaw: 0 })
    const [isExecuting, setIsExecuting] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Reset to intro when the lesson changes
    useEffect(() => {
        setMissionState("intro")
        setLastScore(0)
    }, [currentLessonId])

    const currentLesson =
        beginnerLessons.find((l) => l.id === currentLessonId) || beginnerLessons[0]
    const currentIndex = beginnerLessons.findIndex(
        (l) => l.id === currentLesson.id
    )
    const hasNextMission = currentIndex < beginnerLessons.length - 1

    const handleMissionComplete = useCallback((score: number) => {
        setLastScore(score)
        setMissionState("completed")
    }, [])

    const handleMissionFailed = useCallback(() => {
        setMissionState("failed")
    }, [])

    const handleNextMission = useCallback(() => {
        if (hasNextMission) {
            const nextLesson = beginnerLessons[currentIndex + 1]
            setLesson(nextLesson.id)
            setMissionState("intro")
        }
    }, [currentIndex, hasNextMission, setLesson])

    const handleRetry = useCallback(() => {
        setMissionState("coding")
    }, [])

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
            toast.success("Fullscreen enabled")
        } else {
            document.exitFullscreen()
            toast.success("Fullscreen disabled")
        }
    }

    const toggleTheme = () => {
        const current = resolvedTheme ?? "dark"
        const next = current === "dark" ? "light" : "dark"
        setTheme(next)
        toast.success(`Theme switched: ${next}`)
    }

    return (
        <div className="h-screen w-screen bg-background overflow-hidden flex flex-col relative transition-colors duration-300">
            {/* Dynamic Background Elements - adjust opacity based on theme */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none z-0 opacity-50 dark:opacity-100" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-600/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none z-0 opacity-50 dark:opacity-100" />

            {/* ─── Premium Header ───────────────────────────────── */}
            <header className="h-16 border-b border-border flex items-center px-6 bg-background/80 backdrop-blur-xl shrink-0 z-20 transition-colors duration-300 gap-6">
                <BackButton />
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                            <Cpu className="w-6 h-6 animate-pulse text-white" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="font-black text-lg text-foreground tracking-tighter leading-none flex items-center gap-1">
                                SKYMAKER <span className="text-blue-500">EDU</span>
                            </h1>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-0.5">
                                Robotics Platform
                            </span>
                        </div>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2 bg-blue-600 text-white hover:bg-blue-500 hover:text-white px-4 h-8 rounded-md text-xs font-bold"
                            onClick={() => toast.info("Curriculum is already active")}
                        >
                            <GraduationCap className="w-3.5 h-3.5" />
                            Curriculum
                        </Button>
                        <CommandGuide />
                        <Link href="/missions">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 text-muted-foreground hover:text-foreground px-4 h-8 transition-all text-xs font-bold"
                            >
                                Missions
                            </Button>
                        </Link>
                        <Link href="/dashboard">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 text-muted-foreground hover:text-foreground px-4 h-8 transition-all text-xs font-bold"
                            >
                                <LayoutDashboard className="w-3.5 h-3.5" />
                                Statistics
                            </Button>
                        </Link>
                    </nav>
                </div>

                <div className="ml-auto flex items-center gap-4">
                    <div className="hidden xl:flex items-center gap-4 mr-4 text-left">
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest leading-none mb-1">
                                Missions
                            </span>
                            <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 leading-none">
                                {completedLessons.length} / {beginnerLessons.length}
                            </span>
                        </div>
                        <div className="w-px h-8 bg-border" />
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest leading-none mb-1">
                                System
                            </span>
                            <span
                                className={`text-[10px] font-bold leading-none ${isConnected
                                    ? "text-emerald-500 dark:text-emerald-400"
                                    : "text-muted-foreground/60"
                                    }`}
                            >
                                {isConnected ? "LINK ACTIVE" : "SIM MODE"}
                            </span>
                        </div>
                        <div className="w-px h-8 bg-border" />
                    </div>

                    {mounted && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-foreground hover:bg-muted h-9 w-9"
                            onClick={toggleTheme}
                            title="Toggle theme"
                        >
                            {resolvedTheme === "dark" ? (
                                <Sun className="w-4 h-4" />
                            ) : (
                                <Moon className="w-4 h-4" />
                            )}
                        </Button>
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground hover:bg-muted h-9 w-9"
                        onClick={toggleFullscreen}
                        title="Toggle fullscreen"
                    >
                        <Maximize className="w-4 h-4" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative text-muted-foreground hover:text-foreground hover:bg-muted h-9 w-9"
                        onClick={() => toast.info("No new notifications")}
                    >
                        <Bell className="w-4 h-4" />
                    </Button>

                    <div className="pl-3 border-l border-border py-1">
                        <AuthButton />
                    </div>
                </div>
            </header>

            {/* ─── Main Content ─────────────────────────────────── */}
            <div className="flex-1 min-h-0 relative z-10 font-sans">
                {/* Mission Intro State */}
                {missionState === "intro" && (
                    <MissionIntro
                        lesson={currentLesson}
                        missionIndex={currentIndex}
                        totalMissions={beginnerLessons.length}
                        onStart={() => setMissionState("coding")}
                    />
                )}

                {/* Mission Completion State */}
                {missionState === "completed" && (
                    <MissionCompletion
                        lesson={currentLesson}
                        missionIndex={currentIndex}
                        score={lastScore}
                        onNextMission={handleNextMission}
                        onRetry={handleRetry}
                        hasNextMission={hasNextMission}
                    />
                )}

                {/* Coding / Running / Failed States */}
                {(missionState === "coding" ||
                    missionState === "running" ||
                    missionState === "failed") && (
                        <ResizablePanelGroup direction="horizontal">
                            {/* Left: Code Editor */}
                            <ResizablePanel
                                defaultSize={35}
                                minSize={25}
                                className="bg-transparent h-full"
                            >
                                <div className="h-full border-r border-border">
                                    <PythonEditor
                                        key={currentLessonId}
                                        isFlying={false}
                                        isExecutingCode={isExecuting}
                                        onExecutionStart={() => {
                                            setIsExecuting(true)
                                            setMissionState("running")
                                        }}
                                        onExecutionEnd={() => setIsExecuting(false)}
                                        setSimState={setSimState}
                                        defaultCode={templateCode}
                                        onMissionComplete={handleMissionComplete}
                                        onMissionFailed={handleMissionFailed}
                                        theme={resolvedTheme}
                                    />
                                </div>
                            </ResizablePanel>

                            <ResizableHandle className="bg-border w-1 hover:bg-blue-500/20 transition-colors" />

                            {/* Middle: Simulation */}
                            <ResizablePanel defaultSize={40} className="h-full">
                                <div className="h-full w-full p-2 bg-slate-100 dark:bg-black/20">
                                    <SimulationCanvas
                                        position={simState}
                                        yaw={simState.yaw}
                                    />
                                </div>
                            </ResizablePanel>

                            <ResizableHandle className="bg-border w-1 hover:bg-blue-500/20 transition-colors" />

                            {/* Right: Lesson Panel */}
                            <ResizablePanel
                                defaultSize={25}
                                minSize={20}
                                className="bg-transparent h-full"
                            >
                                <div className="h-full border-l border-border overflow-hidden">
                                    <LessonPanel />
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    )}
            </div>
        </div>
    )
}
