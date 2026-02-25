"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Book,
    Rocket,
    ArrowUp,
    RotateCw,
    Zap,
    ChevronRight,
    Terminal
} from "lucide-react"

export function CommandGuide() {
    const categories = [
        {
            title: "Basic Operations",
            icon: <Rocket className="w-4 h-4 text-emerald-500" />,
            commands: [
                {
                    name: "drone.takeoff()",
                    description: "Initializes motors and lifts the drone to 1 meter hover height. Always the first command in your mission.",
                    example: "drone.takeoff()",
                    details: "Must be used while on the ground. Ignored if already flying."
                },
                {
                    name: "drone.land()",
                    description: "Gently brings the drone down to altitude 0 and shuts off motors.",
                    example: "drone.land()",
                    details: "Always include this at the end of your script to secure the aircraft."
                }
            ]
        },
        {
            title: "Movement (D-Pad)",
            icon: <ArrowUp className="w-4 h-4 text-blue-500" />,
            commands: [
                {
                    name: "drone.forward(meters)",
                    description: "Moves the drone forward by the specified distance.",
                    example: "drone.forward(2)",
                    details: "Values are in meters. Use speed=X parameter to change velocity."
                },
                {
                    name: "drone.back(meters)",
                    description: "Moves the drone backwards from its current position.",
                    example: "drone.back(1.5)",
                    details: "Useful for returning to Home base after a mission."
                },
                {
                    name: "drone.left(m) / drone.right(m)",
                    description: "Strafes the drone sideways without changing its rotation.",
                    example: "drone.right(3)",
                    details: "Also known as 'Roll' movement in pilot terms."
                }
            ]
        },
        {
            title: "Altitude & Rotation",
            icon: <RotateCw className="w-4 h-4 text-purple-500" />,
            commands: [
                {
                    name: "drone.climb(meters)",
                    description: "Increases the altitude of the drone.",
                    example: "drone.climb(5)",
                    details: "Aliases: drone.up(), drone.go_up()"
                },
                {
                    name: "drone.descend(meters)",
                    description: "Decreases the altitude of the drone.",
                    example: "drone.descend(2)",
                    details: "Aliases: drone.down(), drone.go_down()"
                },
                {
                    name: "drone.turn_right(degrees)",
                    description: "Rotates the drone clockwise on its center axis.",
                    example: "drone.turn_right(90)",
                    details: "Aliases: drone.rotate_right(), drone.cw()"
                }
            ]
        },
        {
            title: "Stunts & Utilities",
            icon: <Zap className="w-4 h-4 text-orange-500" />,
            commands: [
                {
                    name: "drone.flip(direction)",
                    description: "Performs an automated aerobatic flip in the specified direction.",
                    example: "drone.flip('back')",
                    details: "Directions: 'forward', 'back', 'left', 'right'. Caution: High battery usage."
                },
                {
                    name: "drone.sleep(ms)",
                    description: "Pauses execution for a specified duration in milliseconds.",
                    example: "drone.sleep(3000) # Wait 3 seconds",
                    details: "Aliases: drone.wait(), drone.hover()"
                }
            ]
        }
    ];

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground px-3 h-8 text-[11px] font-bold border border-border bg-muted/50 hover:bg-muted transition-all">
                    <Book className="w-3.5 h-3.5" />
                    PILOT&apos;S MANUAL
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[85vh] bg-background border border-border text-foreground p-0 overflow-hidden flex flex-col shadow-2xl antialiased">
                <DialogHeader className="p-8 border-b border-border bg-gradient-to-br from-blue-600/10 to-transparent shrink-0">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Book className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-black tracking-tight">Pilot Training Manual</DialogTitle>
                            <DialogDescription className="text-muted-foreground/60 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                                SkyMaker v1.0 Command Specifications
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 min-h-0 overflow-hidden relative">
                    <ScrollArea className="h-full w-full">
                        <div className="p-8 pb-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {categories.map((cat, i) => (
                                    <div key={i} className="space-y-4">
                                        <div className="flex items-center gap-2 pb-2 border-b border-border">
                                            {cat.icon}
                                            <h3 className="font-bold text-xs tracking-widest uppercase text-muted-foreground">{cat.title}</h3>
                                        </div>
                                        <div className="space-y-4">
                                            {cat.commands.map((cmd, j) => (
                                                <div key={j} className="bg-muted/30 p-5 rounded-xl border border-border space-y-3 hover:bg-muted/50 transition-colors group">
                                                    <div className="flex items-center justify-between">
                                                        <code className="text-blue-500 dark:text-blue-400 font-bold text-sm font-mono tracking-tighter bg-blue-500/10 px-2 py-0.5 rounded">
                                                            {cmd.name}
                                                        </code>
                                                        <ChevronRight className="w-4 h-4 text-muted-foreground/20 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                                    </div>
                                                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                                                        {cmd.description}
                                                    </p>
                                                    <div className="bg-muted rounded-lg p-3 border border-border flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Terminal className="w-3 h-3 text-muted-foreground/50" />
                                                            <code className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono italic">
                                                                {cmd.example}
                                                            </code>
                                                        </div>
                                                        <span className="text-[9px] text-muted-foreground/40 font-bold uppercase tracking-tighter">Usage Code</span>
                                                    </div>
                                                    <p className="text-[9px] text-muted-foreground/60 italic">
                                                        Pro-tip: {cmd.details}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </ScrollArea>
                </div>

                <div className="p-4 bg-muted/50 border-t border-border flex items-center justify-center gap-4 shrink-0">
                    <span className="text-[10px] text-muted-foreground/40 font-bold tracking-widest uppercase">Safe Flight Protocol Active</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[10px] text-muted-foreground/40 font-bold tracking-widest uppercase">Encryption Secure</span>
                </div>
            </DialogContent>
        </Dialog>
    )
}
