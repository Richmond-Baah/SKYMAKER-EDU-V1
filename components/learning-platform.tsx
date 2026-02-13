"use client"

import { useState } from "react"
import Link from "next/link"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { LessonPanel } from "@/components/lesson-panel"
import { SimulationCanvas } from "@/components/simulation-canvas"
import PythonEditor from "@/components/python-editor"
import { useDroneStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Settings, User, Bell, ChevronDown, GraduationCap, Cpu, Globe } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { CommandGuide } from "@/components/command-guide"
import { useDroneLink } from "@/hooks/use-drone-link"

export function LearningPlatform() {
    const { currentLessonId, code: templateCode } = useDroneStore();
    const { isConnected } = useDroneLink();

    // Simulation state is managed here to bridge Editor and Visualizer
    const [simState, setSimState] = useState({ x: 0, y: 0, z: 0, yaw: 0 });
    const [isExecuting, setIsExecuting] = useState(false);

    return (
        <div className="h-screen w-screen bg-[#050507] overflow-hidden flex flex-col relative">
            {/* Dynamic Background Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none z-0" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-600/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none z-0" />

            {/* Premium Header */}
            <header className="h-16 border-b border-white/5 flex items-center px-6 bg-black/40 backdrop-blur-xl shrink-0 z-20">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                            <Cpu className="w-6 h-6 animate-pulse text-white" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="font-black text-lg text-white tracking-tighter leading-none flex items-center gap-1">
                                SKYMAKER <span className="text-blue-500">EDU</span>
                            </h1>
                            <span className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] mt-0.5">Robotics Platform</span>
                        </div>
                    </div>

                    <nav className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
                        <Button variant="ghost" size="sm" className="gap-2 bg-blue-600 text-white hover:bg-blue-500 hover:text-white px-4 h-8 rounded-md text-xs font-bold" onClick={() => toast.info("Curriculum is already active")}>
                            <GraduationCap className="w-3.5 h-3.5" />
                            Curriculum
                        </Button>
                        <CommandGuide />
                        <Link href="/dashboard">
                            <Button variant="ghost" size="sm" className="gap-2 text-white/60 hover:text-white px-4 h-8 transition-all text-xs font-bold">
                                <LayoutDashboard className="w-3.5 h-3.5" />
                                Statistics
                            </Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="gap-2 text-white/60 hover:text-white px-4 h-8 text-xs font-bold" onClick={() => toast.warning("Community features are coming soon!")}>
                            <Globe className="w-3.5 h-3.5" />
                            Community
                        </Button>
                    </nav>
                </div>

                <div className="ml-auto flex items-center gap-4">
                    <div className="hidden xl:flex items-center gap-4 mr-4 text-left">
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] text-white/40 uppercase font-black tracking-widest leading-none mb-1">System Status</span>
                            <span className={`text-[10px] font-bold leading-none ${isConnected ? 'text-emerald-400' : 'text-red-400 animate-pulse'}`}>
                                {isConnected ? 'LINK ACTIVE' : 'DISCONNECTED'}
                            </span>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                    </div>

                    <Button variant="ghost" size="icon" className="relative text-white/60 hover:text-white hover:bg-white/5 h-9 w-9" onClick={() => toast.info("No new notifications")}>
                        <Bell className="w-4 h-4" />
                        <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-blue-500 rounded-full border border-[#050507]" />
                    </Button>

                    <div className="flex items-center gap-3 pl-3 border-l border-white/10 py-1 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => toast.info("Profile settings coming soon")}>
                        <div className="flex flex-col items-end leading-tight">
                            <span className="text-xs font-bold text-white">Pilot Cadet</span>
                            <span className="text-[9px] text-white/40 font-bold uppercase tracking-tighter">Level 4</span>
                        </div>
                        <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/10 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-xs font-bold text-white">
                            PX
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 min-h-0 relative z-10 font-sans">
                <ResizablePanelGroup direction="horizontal">
                    {/* Left: Code Editor */}
                    <ResizablePanel defaultSize={35} minSize={25} className="bg-transparent h-full">
                        <div className="h-full border-r border-white/5">
                            <PythonEditor
                                key={currentLessonId}
                                isFlying={false}
                                isExecutingCode={isExecuting}
                                onExecutionStart={() => setIsExecuting(true)}
                                onExecutionEnd={() => setIsExecuting(false)}
                                setSimState={setSimState}
                                defaultCode={templateCode}
                            />
                        </div>
                    </ResizablePanel>

                    <ResizableHandle className="bg-transparent w-1 hover:bg-blue-500/20 transition-colors" />

                    {/* Middle: Simulation */}
                    <ResizablePanel defaultSize={40} className="h-full">
                        <div className="h-full w-full p-2 bg-black/20">
                            <SimulationCanvas position={simState} yaw={simState.yaw} />
                        </div>
                    </ResizablePanel>

                    <ResizableHandle className="bg-transparent w-1 hover:bg-blue-500/20 transition-colors" />

                    {/* Right: Lesson Panel */}
                    <ResizablePanel defaultSize={25} minSize={20} className="bg-transparent h-full">
                        <div className="h-full border-l border-white/5 overflow-hidden">
                            <LessonPanel />
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    )
}
