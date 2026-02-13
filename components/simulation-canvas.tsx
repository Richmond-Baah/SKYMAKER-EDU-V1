
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
        <div className="w-full h-full relative bg-[#050507] rounded-3xl overflow-hidden border border-white/5 shadow-2xl group">
            {/* The core 3D scene */}
            <SimulationWindow position={position} yaw={yaw} />

            {/* Futuristic HUD Overlays */}

            {/* Top Left: System Status */}
            <div className="absolute top-6 left-6 flex flex-col gap-3 pointer-events-none">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse" />
                    <span className="text-[10px] font-black tracking-[0.2em] text-white/60 uppercase">System Active</span>
                </div>
                <div className="glass-dark border-white/10 px-4 py-2 rounded-xl flex items-center gap-3 backdrop-blur-3xl">
                    <Binary className="w-4 h-4 text-blue-400" />
                    <div className="h-4 w-px bg-white/10" />
                    <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-white/40 uppercase">Mode</span>
                        <span className="text-[10px] font-black text-white">VIRTUAL ENVIRONMENT</span>
                    </div>
                </div>
            </div>

            {/* Top Right: Mission Parameters */}
            <div className="absolute top-6 right-6 flex flex-col items-end gap-2 pointer-events-none">
                <Badge variant="outline" className="bg-black/40 backdrop-blur border-white/10 text-white/60 font-mono text-[9px]">
                    LAT: 37.7749 • LON: -122.4194
                </Badge>
                <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-lg glass border-white/10 flex items-center justify-center">
                        <Shield className="w-3.5 h-3.5 text-white/40" />
                    </div>
                    <div className="w-8 h-8 rounded-lg glass border-white/10 flex items-center justify-center">
                        <MapIcon className="w-3.5 h-3.5 text-white/40" />
                    </div>
                </div>
            </div>

            {/* Bottom HUD: Telemetry Bar */}
            <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row items-center md:items-end justify-between pointer-events-none gap-4">
                <div className="flex flex-col gap-2 w-full md:w-auto">
                    <div className="glass-dark border-white/10 rounded-2xl p-4 flex gap-4 md:gap-8 items-center backdrop-blur-3xl justify-center md:justify-start">
                        <div className="flex flex-col min-w-[60px]">
                            <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest leading-none mb-1">Altitude</span>
                            <span className="text-xl font-black text-blue-400 tabular-nums leading-none">{position.y.toFixed(2)}<small className="text-[10px] ml-0.5 opacity-50">M</small></span>
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <div className="flex flex-col min-w-[60px]">
                            <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest leading-none mb-1">Horizon</span>
                            <span className="text-xl font-black text-white tabular-nums leading-none">{yaw.toFixed(0)}°</span>
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <div className="flex flex-col min-w-[60px]">
                            <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest leading-none mb-1">Signal</span>
                            <div className="flex gap-0.5 mt-0.5">
                                {[1, 2, 3, 4, 5].map(i => <div key={i} className={`w-1 h-3 rounded-full ${i <= 4 ? 'bg-blue-500' : 'bg-white/10'}`} />)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-white/5 md:bg-transparent md:border-none md:p-0">
                    <div className="flex flex-col items-end leading-none">
                        <span className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Safe Zone</span>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tight">Nominal</span>
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full glass border-white/20 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                        <Crosshair className="w-4 h-4 md:w-5 md:h-5 text-blue-400 animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Viewport Corners */}
            <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-white/20 rounded-tl-lg pointer-events-none" />
            <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-white/20 rounded-tr-lg pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-white/20 rounded-bl-lg pointer-events-none" />
            <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-white/20 rounded-br-lg pointer-events-none" />
        </div>
    )
}

