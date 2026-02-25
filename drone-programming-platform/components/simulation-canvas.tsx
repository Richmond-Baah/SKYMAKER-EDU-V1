"use client"
import SimulationWindow from "@/components/simulation-window";
import { Activity, Shield, Crosshair, Map as MapIcon, Layers, ChevronRight, Binary } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SimulationCanvasProps {
    position: { x: number; y: number; z: number };
    yaw: number;
}

export function SimulationCanvas({ position, yaw }: SimulationCanvasProps) {
    return (
        <div className="w-full h-full relative bg-background rounded-3xl overflow-hidden border border-border shadow-2xl group transition-colors duration-300">
            {/* The core 3D scene */}
            <SimulationWindow position={position} yaw={yaw} />

            {/* Futuristic HUD Overlays */}

            {/* Top Left: System Status */}
            <div className="absolute top-6 left-6 flex flex-col gap-3 pointer-events-none">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse" />
                    <span className="text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase">System Active</span>
                </div>
                <div className="bg-background/60 backdrop-blur-md border border-border px-4 py-2 rounded-xl flex items-center gap-3 shadow-sm">
                    <Binary className="w-4 h-4 text-blue-500" />
                    <div className="h-4 w-px bg-border" />
                    <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-muted-foreground uppercase">Mode</span>
                        <span className="text-[10px] font-black text-foreground">VIRTUAL ENVIRONMENT</span>
                    </div>
                </div>
            </div>

            {/* Top Right: Mission Parameters */}
            <div className="absolute top-6 right-6 flex flex-col items-end gap-2 pointer-events-none">
                <Badge variant="outline" className="bg-background/60 backdrop-blur border-border text-muted-foreground font-mono text-[9px] shadow-sm">
                    LAT: 37.7749 • LON: -122.4194
                </Badge>
                <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-lg bg-background/60 backdrop-blur border border-border flex items-center justify-center shadow-sm">
                        <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-background/60 backdrop-blur border border-border flex items-center justify-center shadow-sm">
                        <MapIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                </div>
            </div>

            {/* Bottom HUD: Telemetry Bar */}
            <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row items-center md:items-end justify-between pointer-events-none gap-4">
                <div className="flex flex-col gap-2 w-full md:w-auto">
                    <div className="bg-background/60 backdrop-blur-md border border-border rounded-2xl p-4 flex gap-4 md:gap-8 items-center shadow-lg justify-center md:justify-start">
                        <div className="flex flex-col min-w-[60px]">
                            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Altitude</span>
                            <span className="text-xl font-black text-blue-500 tabular-nums leading-none">{position.y.toFixed(2)}<small className="text-[10px] ml-0.5 opacity-50">M</small></span>
                        </div>
                        <div className="h-8 w-px bg-border" />
                        <div className="flex flex-col min-w-[60px]">
                            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Horizon</span>
                            <span className="text-xl font-black text-foreground tabular-nums leading-none">{yaw.toFixed(0)}°</span>
                        </div>
                        <div className="h-8 w-px bg-border" />
                        <div className="flex flex-col min-w-[60px]">
                            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Signal</span>
                            <div className="flex gap-0.5 mt-0.5">
                                {[1, 2, 3, 4, 5].map(i => <div key={i} className={`w-1 h-3 rounded-full ${i <= 4 ? 'bg-blue-500' : 'bg-muted-foreground/20'}`} />)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-background/60 backdrop-blur-md p-2 rounded-2xl border border-border md:bg-transparent md:border-none md:p-0">
                    <div className="flex flex-col items-end leading-none">
                        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Safe Zone</span>
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tight">Nominal</span>
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-background/60 backdrop-blur border border-border flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                        <Crosshair className="w-4 h-4 md:w-5 md:h-5 text-blue-500 animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Viewport Corners */}
            <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-white/20 dark:border-white/20 border-black/10 rounded-tl-lg pointer-events-none" />
            <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-white/20 dark:border-white/20 border-black/10 rounded-tr-lg pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-white/20 dark:border-white/20 border-black/10 rounded-bl-lg pointer-events-none" />
            <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-white/20 dark:border-white/20 border-black/10 rounded-br-lg pointer-events-none" />
        </div>
    )
}
