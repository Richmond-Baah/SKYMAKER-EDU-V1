"use client"

import { useDroneStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
    Rocket,
    ArrowUp,
    ArrowDown,
    RotateCcw,
    RotateCw,
    Zap,
    CircleDot,
    Timer,
    PlaneLanding
} from "lucide-react";
import { toast } from "sonner";

export function CommandLibrary() {
    const { code, setCode } = useDroneStore();

    const insertCommand = (cmd: string) => {
        const newCode = `${code.trim()}\n${cmd}`;
        setCode(newCode);
        toast.info(`Inserted: ${cmd}`);
    };

    const commands = [
        { id: 'takeoff', icon: <Rocket className="w-4 h-4" />, label: 'Take Off', snippet: 'drone.takeoff()', color: 'text-emerald-400' },
        { id: 'land', icon: <PlaneLanding className="w-4 h-4" />, label: 'Land', snippet: 'drone.land()', color: 'text-red-400' },
        { id: 'climb', icon: <ArrowUp className="w-4 h-4" />, label: 'Climb 2m', snippet: 'drone.climb(2)', color: 'text-blue-400' },
        { id: 'descend', icon: <ArrowDown className="w-4 h-4" />, label: 'Descend 1m', snippet: 'drone.descend(1)', color: 'text-blue-400' },
        { id: 'forward', icon: <ArrowUp className="w-4 h-4 rotate-0" />, label: 'Forward 2m', snippet: 'drone.forward(2)', color: 'text-drone-cyan' },
        { id: 'back', icon: <ArrowDown className="w-4 h-4 rotate-0" />, label: 'Back 2m', snippet: 'drone.back(2)', color: 'text-drone-cyan' },
        { id: 'turn_left', icon: <RotateCcw className="w-4 h-4" />, label: 'Turn Left 90°', snippet: 'drone.turn_left(90)', color: 'text-purple-400' },
        { id: 'turn_right', icon: <RotateCw className="w-4 h-4" />, label: 'Turn Right 90°', snippet: 'drone.turn_right(90)', color: 'text-purple-400' },
        { id: 'hover', icon: <CircleDot className="w-4 h-4" />, label: 'Hover 2s', snippet: 'drone.hover(2000)', color: 'text-drone-gold' },
        { id: 'wait', icon: <Timer className="w-4 h-4" />, label: 'Wait 1s', snippet: 'drone.wait(1000)', color: 'text-drone-gold' },
        { id: 'flip', icon: <Zap className="w-4 h-4" />, label: 'Stunt Flip', snippet: 'drone.flip("forward")', color: 'text-orange-400' },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-white/90 font-bold text-sm uppercase tracking-wider">
                <Rocket className="w-4 h-4 text-drone-blue" />
                <h3>Pilot&apos;s Handbook</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
                {commands.map((cmd) => (
                    <Button
                        key={cmd.id}
                        variant="ghost"
                        className="glass-dark border border-white/5 hover:border-white/10 hover:bg-white/5 h-auto py-3 px-3 flex flex-col items-center gap-2 group transition-all"
                        onClick={() => insertCommand(cmd.snippet)}
                    >
                        <div className={`${cmd.color} group-hover:scale-110 transition-transform`}>
                            {cmd.icon}
                        </div>
                        <span className="text-[10px] font-bold text-white/60 tracking-tighter">{cmd.label}</span>
                    </Button>
                ))}
            </div>
        </div>
    );
}
