"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Play, RotateCcw, Copy, Check, AlertCircle, BookOpen, Rocket, Terminal, Code2, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useDroneStore } from "@/lib/store"
import { beginnerLessons } from "@/lib/lessons"
import { toast } from "sonner"
import { useDroneLink } from "@/hooks/use-drone-link"

interface PythonEditorProps {
  isFlying: boolean
  isExecutingCode: boolean
  onExecutionStart: () => void
  onExecutionEnd: () => void
  setSimState: (state: { x: number, y: number, z: number, yaw: number }) => void
  defaultCode?: string
}

interface ConsoleOutput {
  type: "output" | "error" | "success" | "info" | "warning"
  message: string
  timestamp: string
}

export default function PythonEditor({
  isFlying,
  isExecutingCode,
  onExecutionStart,
  onExecutionEnd,
  setSimState,
  defaultCode,
}: PythonEditorProps) {
  const [code, setCode] = useState(defaultCode || `# SkyMaker Drone Pilot v1.0
# Mission: My First Flight

drone.takeoff()
drone.climb(2)
drone.forward(2)
drone.land()

print("Mission Success!")`)

  const [consoleOutput, setConsoleOutput] = useState<ConsoleOutput[]>([])

  useEffect(() => {
    setConsoleOutput([
      {
        type: "info",
        message: "SYSTEM INITIALIZED: Ready for code input.",
        timestamp: new Date().toLocaleTimeString(),
      },
    ])
  }, [])

  const [copied, setCopied] = useState(false)
  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success("Code copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const { telemetry, sendControl, isConnected } = useDroneLink()

  // Simulation State Tracking
  const simState = useRef({ x: 0, y: 0, z: 0, yaw: 0 });
  const peakMetrics = useRef({ maxAltitude: 0, maxDistance: 0 });
  const executionId = useRef(0);

  const updateSim = (dx: number, dy: number, dz: number, dYaw: number, duration: number) => {
    const currentId = executionId.current;
    const safeDuration = duration > 0 ? duration : 1;
    const steps = Math.floor(20 * safeDuration);
    if (steps <= 0) return Promise.resolve();

    const stepDx = dx / steps;
    const stepDy = dy / steps;
    const stepDz = dz / steps;
    const stepDYaw = dYaw / steps;

    return new Promise<void>(resolve => {
      let count = 0;
      const intervalId = setInterval(() => {
        if (count >= steps || executionId.current !== currentId) {
          clearInterval(intervalId);
          resolve();
          return;
        }

        simState.current.x += stepDx;
        simState.current.y += stepDy;
        simState.current.z += stepDz;
        simState.current.yaw += stepDYaw;

        // Track peak metrics
        const dist = Math.sqrt(simState.current.x ** 2 + simState.current.z ** 2);
        peakMetrics.current.maxAltitude = Math.max(peakMetrics.current.maxAltitude, simState.current.y);
        peakMetrics.current.maxDistance = Math.max(peakMetrics.current.maxDistance, dist);

        setSimState({ ...simState.current });
        count++;
      }, 50);
    });
  }

  const handleExecute = async (mode: "simulate" | "drone") => {
    if (!code.trim()) {
      addConsoleOutput("error", "EXECUTION REJECTED: Code buffer is empty.")
      return
    }

    onExecutionStart()
    executionId.current += 1;
    const currentId = executionId.current;
    const modeLabel = mode === "simulate" ? "SIMULATION" : "HARDWARE";
    addConsoleOutput("info", `INITIATING: ${modeLabel} EXECUTION ENGINE...`)

    simState.current = { x: 0, y: 0, z: 0, yaw: 0 };
    peakMetrics.current = { maxAltitude: 0, maxDistance: 0 };
    setSimState({ x: 0, y: 0, z: 0, yaw: 0 });

    const lines = code.split("\n")

    let hasErrors = false;
    const activeDirectives: { lineIndex: number, content: string }[] = []

    lines.forEach((line, index) => {
      const trimmed = line.trim()

      // Ignore empty lines, comments, and boilerplate keywords
      if (
        trimmed === "" ||
        trimmed.startsWith("#") ||
        trimmed.startsWith("//") ||
        trimmed.includes("function") ||
        trimmed.includes("async") ||
        trimmed === "}" ||
        trimmed === "{"
      ) return

      if (trimmed.includes("drone.")) {
        const cmdMatch = trimmed.match(/drone\.(\w+)\(/)
        if (cmdMatch) {
          const cmd = cmdMatch[1].toLowerCase();
          const allowedCommands = [
            "takeoff", "take_off",
            "land",
            "forward",
            "backward", "back",
            "left",
            "right",
            "up", "climb", "go_up",
            "down", "descend", "go_down",
            "rotate", "cw", "ccw", "turn_right", "turn_left", "rotate_right", "rotate_left",
            "hover", "wait", "sleep",
            "flip"
          ];
          if (!allowedCommands.includes(cmd)) {
            addConsoleOutput("error", `SCHEMA ERROR [Line ${index + 1}]: Directive '${cmd}' is not defined.`);
            hasErrors = true;
          } else {
            activeDirectives.push({ lineIndex: index, content: trimmed });
          }
        }
      } else if (trimmed.includes("print(")) {
        activeDirectives.push({ lineIndex: index, content: trimmed });
      } else {
        addConsoleOutput("error", `SYNTAX ERROR [Line ${index + 1}]: Unknown directive '${trimmed}'.`);
        hasErrors = true;
      }
    })

    if (hasErrors) {
      addConsoleOutput("error", "EXECUTION HALTED: Compilation failed.");
      onExecutionEnd();
      return;
    }

    if (mode === "drone" && !isConnected) {
      addConsoleOutput("info", "SEARCHING FOR DRONE VIA WI-FI...");
      await new Promise(r => setTimeout(r, 1000));
      addConsoleOutput("error", "UPLOAD FAILED: NO DRONE FOUND ON NETWORK.");
      addConsoleOutput("info", "TROUBLESHOOT: Connect to 'ESP-DRONE' Wi-Fi access point.");
      onExecutionEnd();
      toast.error("Drone Connection Failed", {
        description: "Please check your Wi-Fi settings and ensure you are connected to the drone."
      });
      return;
    }

    if (mode === "drone") {
      addConsoleOutput("success", "HARDWARE LINK ESTABLISHED (192.168.43.42).");
      addConsoleOutput("info", "UPLOADING FLIGHT PLAN...");
      await new Promise(r => setTimeout(r, 1000));
    }

    try {
      let commandCount = 0

      // Reset simulation state only for simulation mode
      if (mode === "simulate") {
        simState.current = { x: 0, y: 0, z: 0, yaw: 0 };
        setSimState({ x: 0, y: 0, z: 0, yaw: 0 });
      }

      for (const dir of activeDirectives) {
        setActiveLineIndex(dir.lineIndex);
        const trimmed = dir.content;
        if (trimmed.includes("drone.")) {
          const match = trimmed.match(/drone\.(\w+)(\((.*?)\))?/)
          if (match) {
            const command = match[1].toLowerCase()
            const paramsStr = match[3] || ""
            const params: Record<string, any> = {}

            paramsStr.split(",").forEach(p => {
              const parts = p.split("=");
              if (parts.length === 2) {
                const k = parts[0].trim();
                const v = parts[1].trim().replace(/["']/g, "");
                params[k] = isNaN(parseFloat(v)) ? v : parseFloat(v);
              } else if (parts.length === 1 && parts[0].trim()) {
                const v = parts[0].trim().replace(/["']/g, "");
                if (!isNaN(parseFloat(v))) {
                  const val = parseFloat(v);
                  if (["forward", "backward", "back", "left", "right", "up", "climb", "go_up", "down", "descend", "go_down"].includes(command)) params["distance"] = val;
                  else if (command === "hover" || command === "wait" || command === "sleep") params["duration"] = val;
                  else if (command === "rotate" || command === "cw" || command === "ccw" || command === "turn_right" || command === "turn_left" || command === "rotate_right" || command === "rotate_left") params["angle"] = val;
                } else {
                  params["value"] = v;
                }
              }
            })

            // Normalize parameters
            // Movement: meters, Angles: degrees, Time: milliseconds
            const durationMs = params.duration || params.ms || (params.seconds ? params.seconds * 1000 : 1000);
            const speed = params.speed || 1; // m/s
            const angle = params.angle || 90;
            const distance = params.distance || 1;
            const height = params.height || 1;

            commandCount++
            addConsoleOutput("output", `> EXECUTING: ${command}(${paramsStr})`)

            const moveTime = speed > 0 ? distance / speed : 1; // seconds
            const durationS = durationMs / 1000;

            if (mode === "drone") {
              const sendBurst = async (roll: number, pitch: number, yaw: number, thrust: number, burstMs: number) => {
                const startTime = Date.now();
                while (Date.now() - startTime < burstMs) {
                  if (executionId.current !== currentId) break;
                  await sendControl(roll, pitch, yaw, thrust);
                  await new Promise(r => setTimeout(r, 50));
                }
              }

              switch (command) {
                case "takeoff":
                case "take_off":
                  addConsoleOutput("info", "MOTORS ARMED. ASCENDING...");
                  await sendBurst(0, 0, 0, 42000, 1500); // Takeoff burst
                  await sendBurst(0, 0, 0, 32768, 500);  // Settle to hover
                  break;
                case "land":
                  addConsoleOutput("info", "DESCENDING FOR TOUCHDOWN...");
                  await sendBurst(0, 0, 0, 20000, 2000); // Slow descend
                  await sendControl(0, 0, 0, 0);         // Motors off
                  break;
                case "forward":
                  await sendBurst(0, 15, 0, 32768, moveTime * 1000);
                  break;
                case "backward":
                case "back":
                  await sendBurst(0, -15, 0, 32768, moveTime * 1000);
                  break;
                case "left":
                  await sendBurst(-15, 0, 0, 32768, moveTime * 1000);
                  break;
                case "right":
                  await sendBurst(15, 0, 0, 32768, moveTime * 1000);
                  break;
                case "up":
                case "climb":
                case "go_up":
                  await sendBurst(0, 0, 0, 40000, moveTime * 1000);
                  break;
                case "down":
                case "descend":
                case "go_down":
                  await sendBurst(0, 0, 0, 25000, moveTime * 1000);
                  break;
                case "rotate":
                case "cw":
                case "turn_right":
                  await sendBurst(0, 0, angle, 32768, durationS * 1000);
                  break;
                case "ccw":
                case "turn_left":
                  await sendBurst(0, 0, -angle, 32768, durationS * 1000);
                  break;
                case "hover":
                case "wait":
                case "sleep":
                  await sendBurst(0, 0, 0, 32768, durationMs);
                  break;
                case "flip":
                  addConsoleOutput("warning", "STUNT MODE: PERFORMING FLIP...");
                  // Simple mock for flip setpoint sequence
                  await sendBurst(0, 0, 0, 60000, 200);
                  await sendBurst(0, 45, 0, 0, 400);
                  await sendBurst(0, 0, 0, 32768, 500);
                  break;
              }
            } else {
              // Simulation Mode
              const yawRad = (simState.current.yaw * Math.PI) / 180;

              switch (command) {
                case "takeoff":
                case "take_off":
                  if (simState.current.y < 0.1) {
                    await updateSim(0, height, 0, 0, height / 0.5);
                  } else {
                    addConsoleOutput("info", "Takeoff ignored: Drone is already airborne.");
                  }
                  break;
                case "land":
                  if (simState.current.y > 0.1) {
                    await updateSim(0, -simState.current.y, 0, 0, 2.0);
                    if (executionId.current === currentId) {
                      simState.current.y = 0;
                      setSimState({ ...simState.current });
                    }
                  } else {
                    addConsoleOutput("info", "Landing ignored: Drone is already on the ground.");
                  }
                  break;
                case "forward":
                  await updateSim(Math.sin(yawRad) * distance, 0, -Math.cos(yawRad) * distance, 0, moveTime);
                  break;
                case "backward":
                case "back":
                  await updateSim(-Math.sin(yawRad) * distance, 0, Math.cos(yawRad) * distance, 0, moveTime);
                  break;
                case "left":
                  await updateSim(-Math.cos(yawRad) * distance, 0, -Math.sin(yawRad) * distance, 0, moveTime);
                  break;
                case "right":
                  await updateSim(Math.cos(yawRad) * distance, 0, Math.sin(yawRad) * distance, 0, moveTime);
                  break;
                case "up":
                case "climb":
                case "go_up":
                  await updateSim(0, distance, 0, 0, moveTime);
                  break;
                case "down":
                case "descend":
                case "go_down":
                  await updateSim(0, -distance, 0, 0, moveTime);
                  break;
                case "rotate":
                case "cw":
                case "turn_right":
                case "rotate_right":
                  await updateSim(0, 0, 0, angle, durationS);
                  break;
                case "ccw":
                case "turn_left":
                case "rotate_left":
                  await updateSim(0, 0, 0, -angle, durationS);
                  break;
                case "hover":
                case "wait":
                case "sleep":
                  await new Promise<void>(resolve => {
                    const timeout = setTimeout(() => resolve(), durationMs);
                    const checkInterval = setInterval(() => {
                      if (executionId.current !== currentId) {
                        clearTimeout(timeout);
                        clearInterval(checkInterval);
                        resolve();
                      }
                    }, 50);
                  });
                  break;
                case "flip":
                  addConsoleOutput("info", `PERFORMING FLIP: ${params.value || 'forward'}`);
                  await updateSim(0, 0.5, 0, 0, 0.2);
                  await updateSim(0, -0.5, 0, 0, 0.2);
                  break;
              }
            }
          }
        } else if (trimmed.includes("print(")) {
          const match = trimmed.match(/print\((.*?)\)/)
          if (match) {
            const message = match[1].replace(/["']/g, "")
            addConsoleOutput("success", `LOG: ${message}`)
            await new Promise(r => setTimeout(r, 100));
          }
        }
        if (executionId.current !== currentId) break;
      }

      if (executionId.current === currentId) {
        addConsoleOutput("success", `MISSION COMPLETE: ${commandCount} directives executed successfully.`)
      }
    } catch (error) {
      addConsoleOutput("error", `RUNTIME EXCEPTION: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setActiveLineIndex(null);
      onExecutionEnd()

      // Mission Assessment (Simulation Mode Only)
      if (mode === "simulate" && !hasErrors && executionId.current === currentId) {
        const currentLesson = beginnerLessons.find(l => l.id === useDroneStore.getState().currentLessonId);
        if (currentLesson) {
          addConsoleOutput("info", "ANALYZING MISSION DATA...");

          // Assess against Success Criteria
          const criteria = currentLesson.components.successCriteria;
          let failedCriteria: string[] = [];

          addConsoleOutput("info", `PEAK DATA -> Alt: ${peakMetrics.current.maxAltitude.toFixed(1)}m, Dist: ${peakMetrics.current.maxDistance.toFixed(1)}m`);

          // 1. Landing Check (Fundamental)
          if (criteria.landed && simState.current.y > 0.1) {
            failedCriteria.push("Landing required");
          }

          // 2. Altitude Check (Reached at least target)
          if (criteria.altitude && peakMetrics.current.maxAltitude < (criteria.altitude - 0.2)) {
            failedCriteria.push(`Target altitude not reached. Target: ${criteria.altitude}m (Max: ${peakMetrics.current.maxAltitude.toFixed(1)}m)`);
          }

          // 3. Distance Check (Traveled at least target)
          if (criteria.distance && peakMetrics.current.maxDistance < (criteria.distance - 0.2)) {
            failedCriteria.push(`Target distance not reached. Target: ${criteria.distance}m (Max: ${peakMetrics.current.maxDistance.toFixed(1)}m)`);
          }

          // 4. Position Accuracy (Returned to home base - only if landed)
          if (criteria.positionAccuracy && !failedCriteria.includes("Landing required")) {
            const finalDist = Math.sqrt(simState.current.x ** 2 + simState.current.z ** 2);
            if (finalDist > criteria.positionAccuracy) {
              failedCriteria.push(`Return to home failed. Accuracy needed: ${criteria.positionAccuracy}m (Off by: ${finalDist.toFixed(1)}m)`);
            }
          }

          if (failedCriteria.length === 0) {
            const metrics = {
              accuracy: 0.82 + Math.random() * 0.1,
              stability: 9.2 + Math.random() * 0.5,
              time: 24.5
            };

            addConsoleOutput("success", "MISSION ASSESSMENT: PASSED");
            useDroneStore.getState().completeLesson(currentLesson.id, metrics);
            toast.success("Mission Accomplished", {
              description: `Module ${currentLesson.title} passed! Next module unlocked.`,
            });
          } else {
            addConsoleOutput("warning", `MISSION ASSESSMENT: FAILED (${failedCriteria.join(", ")})`);
            toast.error("Mission Failed", {
              description: "Review mission parameters and try again.",
            });
          }
        }
      }
    }
  }

  const addConsoleOutput = (type: ConsoleOutput["type"], message: string) => {
    setConsoleOutput((prev) => [
      ...prev,
      {
        type,
        message,
        timestamp: new Date().toLocaleTimeString(),
      },
    ].slice(-50)) // Keep last 50 lines
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0a0c] overflow-hidden">
      <Card className="flex-1 flex flex-col border-none bg-transparent shadow-none overflow-hidden rounded-none">
        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0 bg-white/[0.02] border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Code2 className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white tracking-tight">Mission Architect</span>
              <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Logic Engine</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 w-8 p-0 hover:bg-white/5 transition-colors text-white/40 hover:text-white"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCode("")}
              disabled={isExecutingCode}
              className="h-8 w-8 p-0 hover:bg-white/5 transition-colors text-white/40 hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
            <div className="w-px h-4 bg-white/10 mx-1" />
            {isExecutingCode ? (
              <Button
                size="sm"
                onClick={() => {
                  executionId.current += 1;
                  simState.current = { x: 0, y: 0, z: 0, yaw: 0 };
                  setSimState({ x: 0, y: 0, z: 0, yaw: 0 });
                  addConsoleOutput("warning", "MISSION ABORTED: Emergency stop triggered.");
                  toast.warning("Simulation Stopped", { description: "Drone motors disarmed. Resetting to default state." });
                  // We don't call onExecutionEnd() here, handleExecute will finish and call it in finally
                }}
                className="h-8 gap-2 bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all active:scale-95 border-none"
              >
                <div className="w-2 h-2 bg-white rounded-sm animate-pulse" />
                STOP
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => handleExecute("simulate")}
                disabled={isExecutingCode}
                className="h-8 gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all active:scale-95 border-none"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                RUN SIM
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => handleExecute("drone")}
              disabled={isExecutingCode || isFlying}
              className="h-8 gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-[0_0_15px_rgba(5,150,105,0.3)] transition-all active:scale-95 border-none"
            >
              <Rocket className="w-3.5 h-3.5 fill-current" />
              UPLOAD
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 min-h-0 flex flex-col p-0 overflow-hidden relative">
          <div className="flex-1 min-h-0 relative flex bg-[#050507]">
            {/* Line numbers marker */}
            <div className="w-10 bg-white/[0.01] border-r border-white/5 flex flex-col items-center py-4 text-[10px] text-white/10 font-mono select-none shrink-0 overflow-hidden">
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-6 flex items-center transition-colors duration-200 ${activeLineIndex === i ? "text-blue-500 font-bold scale-125" : ""}`}
                >
                  {i + 1}
                </div>
              ))}
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 h-full px-4 py-4 bg-transparent text-white/80 font-mono text-[13px] leading-6 resize-none focus:outline-none scrollbar-hide custom-scrollbar"
              placeholder="Initialize drone protocol..."
              spellCheck="false"
              disabled={isExecutingCode}
            />

            {/* Floating editor status */}
            <div className="absolute bottom-4 right-6 flex gap-2 pointer-events-none">
              <Badge variant="outline" className="bg-black/60 backdrop-blur border-white/10 text-[9px] font-mono text-white/20 px-2 py-0">
                UTF-8
              </Badge>
              <Badge variant="outline" className="bg-blue-500/10 backdrop-blur border-blue-500/20 text-[9px] font-mono text-blue-400 px-2 py-0">
                PY3.9
              </Badge>
            </div>
          </div>

          {/* Terminal / Output Area */}
          <div className="h-[180px] shrink-0 border-t border-white/10 flex flex-col bg-[#050507] z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between px-4 py-2 bg-white/[0.03] border-b border-white/5">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-white/60">System Console</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/5 border border-emerald-500/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                  <span className="text-[9px] text-emerald-500/80 uppercase font-bold tracking-tighter">Engine Live</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConsoleOutput([{
                    type: "info",
                    message: "SYSTEM INITIALIZED: Ready for code input.",
                    timestamp: new Date().toLocaleTimeString(),
                  }])}
                  className="h-5 text-[9px] px-2 text-white/30 hover:text-white hover:bg-white/5 uppercase font-bold"
                >
                  Clear
                </Button>
              </div>
            </div>
            <ScrollArea className="flex-1 bg-black/40">
              <div className="p-4 font-mono text-[11px] leading-relaxed space-y-1">
                {consoleOutput.length === 0 ? (
                  <div className="text-white/10 italic">Awaiting drone protocol engagement...</div>
                ) : (
                  consoleOutput.map((output, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 group animate-in fade-in slide-in-from-left-1 duration-200 ${output.type === "error"
                        ? "text-red-400"
                        : output.type === "success"
                          ? "text-emerald-400"
                          : output.type === "output"
                            ? "text-blue-400"
                            : output.type === "warning"
                              ? "text-amber-400"
                              : "text-white/40"
                        }`}
                    >
                      <span className="text-white/10 shrink-0 select-none">[{output.timestamp}]</span>
                      <span className="flex-1 break-all font-medium">{output.message}</span>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

