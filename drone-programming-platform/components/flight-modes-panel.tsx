"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useState } from "react"
import { toast } from "sonner"

export function FlightModesPanel({ onBack }: { onBack: () => void }) {
    const [selectedMode, setSelectedMode] = useState("stabilize")
    const [showPIDTuning, setShowPIDTuning] = useState(false)
    const [pidAxis, setPidAxis] = useState<"roll" | "pitch" | "yaw">("roll")

    // Mock PID values
    const [pidValues, setPidValues] = useState({
        roll: { p: 4.5, i: 0.2, d: 1.8 },
        pitch: { p: 4.5, i: 0.2, d: 1.8 },
        yaw: { p: 5.2, i: 0.1, d: 0.5 },
    })

    // Helper to update specific PID value
    const updatePID = (axis: "roll" | "pitch" | "yaw", param: "p" | "i" | "d", value: number) => {
        setPidValues((prev) => ({
            ...prev,
            [axis]: {
                ...prev[axis],
                [param]: value,
            },
        }))
    }

    const currentPID = pidValues[pidAxis]

    const modes = [
        {
            id: "stabilize",
            name: "STABILIZE",
            description: "Self-leveling, angle limited. Best for beginners.",
            icon: "shield",
        },
        {
            id: "alt-hold",
            name: "ALTITUDE HOLD",
            description: "Maintains height automatically using barometer.",
            icon: "bar-chart",
        },
        {
            id: "sport",
            name: "SPORT",
            description: "High angles, no self-leveling. For experts.",
            icon: "zap",
        },
        {
            id: "acro",
            name: "ACRO",
            description: "Direct gyroscope control. Full manual flight.",
            icon: "activity",
        },
    ]

    const getModeIcon = (iconName: string) => {
        // Simple SVG icons based on name
        if (iconName === "shield")
            return (
                <svg
                    className="w-5 h-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                </svg>
            )
        if (iconName === "bar-chart")
            return (
                <svg
                    className="w-5 h-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                </svg>
            )
        if (iconName === "zap")
            return (
                <svg
                    className="w-5 h-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                </svg>
            )
        return (
            <svg
                className="w-5 h-5 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
            </svg>
        )
    }

    if (showPIDTuning) {
        return (
            <div className="p-4 space-y-4 pb-24">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-foreground mb-1">PID TUNING</h2>
                        <p className="text-xs text-muted-foreground font-mono">Advanced configuration</p>
                    </div>
                    <Button
                        onClick={() => setShowPIDTuning(false)}
                        variant="outline"
                        size="sm"
                        className="text-xs font-mono bg-transparent"
                    >
                        BACK
                    </Button>
                </div>

                {/* Axis selector */}
                <Card className="p-3 bg-card/80 backdrop-blur border-border clip-corner">
                    <p className="text-xs font-mono text-muted-foreground mb-2">SELECT AXIS</p>
                    <div className="grid grid-cols-3 gap-2">
                        {(["roll", "pitch", "yaw"] as const).map((ax) => (
                            <Button
                                key={ax}
                                onClick={() => setPidAxis(ax)}
                                variant={pidAxis === ax ? "default" : "outline"}
                                className={`font-mono uppercase ${pidAxis === ax ? "bg-primary text-primary-foreground" : ""}`}
                            >
                                {ax}
                            </Button>
                        ))}
                    </div>
                </Card>

                {/* PID sliders - Now fully functional with editable values */}
                <Card className="p-4 bg-card/80 backdrop-blur border-border clip-corner space-y-4">
                    <div>
                        <div className="flex justify-between mb-2">
                            <div>
                                <p className="text-sm font-mono font-bold text-foreground">P (Proportional)</p>
                                <p className="text-[10px] text-muted-foreground">Immediate response</p>
                            </div>
                            <p className="text-sm font-mono text-primary font-bold">{currentPID.p.toFixed(1)}</p>
                        </div>
                        <Slider
                            value={[currentPID.p]}
                            onValueChange={([value]) => updatePID(pidAxis, "p", value)}
                            min={0}
                            max={100}
                            step={1}
                            className="w-full"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <div>
                                <p className="text-sm font-mono font-bold text-foreground">I (Integral)</p>
                                <p className="text-[10px] text-muted-foreground">Error correction</p>
                            </div>
                            <p className="text-sm font-mono text-primary font-bold">{currentPID.i.toFixed(1)}</p>
                        </div>
                        <Slider
                            value={[currentPID.i]}
                            onValueChange={([value]) => updatePID(pidAxis, "i", value)}
                            min={0}
                            max={100}
                            step={1}
                            className="w-full"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <div>
                                <p className="text-sm font-mono font-bold text-foreground">D (Derivative)</p>
                                <p className="text-[10px] text-muted-foreground">Dampening</p>
                            </div>
                            <p className="text-sm font-mono text-primary font-bold">{currentPID.d.toFixed(1)}</p>
                        </div>
                        <Slider
                            value={[currentPID.d]}
                            onValueChange={([value]) => updatePID(pidAxis, "d", value)}
                            min={0}
                            max={100}
                            step={1}
                            className="w-full"
                        />
                    </div>
                </Card>

                {/* Save changes */}
                <Button
                    className="w-full h-12 font-mono clip-corner bg-primary hover:bg-primary/90"
                    onClick={() => {
                        toast.success("PID parameters synced to drone memory.");
                        setShowPIDTuning(false);
                    }}
                >
                    SAVE PID SETTINGS
                </Button>
            </div>
        )
    }

    return (
        <div className="p-4 space-y-4 pb-24">
            {/* Header with back button */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-xl font-bold text-foreground mb-1">FLIGHT MODES</h2>
                    <p className="text-xs text-muted-foreground font-mono">Select your flight mode</p>
                </div>
                <Button onClick={onBack} variant="outline" size="sm" className="text-xs font-mono bg-transparent">
                    BACK
                </Button>
            </div>

            {/* Flight modes grid */}
            <div className="grid grid-cols-1 gap-3">
                {modes.map((mode) => (
                    <Card
                        key={mode.id}
                        onClick={() => setSelectedMode(mode.id)}
                        className={`p-4 bg-card/80 backdrop-blur border-2 clip-corner cursor-pointer transition-all ${selectedMode === mode.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                            }`}
                    >
                        <div className="flex items-start gap-3">
                            {getModeIcon(mode.id)}
                            <div className="flex-1">
                                <p className="font-mono font-bold text-foreground">{mode.name}</p>
                                <p className="text-xs text-muted-foreground font-mono mt-1">{mode.description}</p>
                            </div>
                            {selectedMode === mode.id && (
                                <div className="w-6 h-6 rounded-full border-2 border-primary bg-primary/20 flex items-center justify-center flex-shrink-0">
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                </div>
                            )}
                        </div>
                    </Card>
                ))}
            </div>

            {/* Action buttons - Made PID tuning button functional */}
            <div className="space-y-2">
                <Button
                    onClick={() => setShowPIDTuning(true)}
                    className="w-full h-12 font-mono clip-corner bg-primary hover:bg-primary/90"
                >
                    OPEN PID TUNING
                </Button>
                <Button
                    variant="outline"
                    className="w-full h-12 font-mono clip-corner bg-transparent"
                    onClick={() => {
                        const mode = modes.find(m => m.id === selectedMode)?.name;
                        toast.success(`FLIGHT MODE ENGAGED: ${mode}`);
                        onBack();
                    }}
                >
                    APPLY MODE
                </Button>
            </div>
        </div>
    )
}
