"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, RotateCcw, Copy, Check, AlertCircle, BookOpen, Rocket } from "lucide-react"

interface PythonEditorProps {
  isFlying: boolean
  isExecutingCode: boolean
  onExecutionStart: () => void
  onExecutionEnd: () => void
  setSimState: (state: { x: number, y: number, z: number, yaw: number }) => void
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
}: PythonEditorProps) {
  const [code, setCode] = useState(`# Welcome to Drone Programming!
# Learn to code drone behaviors
# Start by using the example buttons below

drone.takeoff()
drone.forward(distance=10, speed=2)
drone.land()
print("Basic flight complete!")
`)

  const [consoleOutput, setConsoleOutput] = useState<ConsoleOutput[]>([
    {
      type: "info",
      message: "Drone Python Editor - Write your own flight scripts!",
      timestamp: "", // Empty initially to prevent hydration mismatch
    },
  ])

  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Watchdog or cleanup if needed
  }, [isExecutingCode, onExecutionEnd])

  // Helper to send commands to API
  const sendCommand = async (roll: number, pitch: number, yaw: number, thrust: number, duration: number) => {
    const interval = 50;
    const steps = (duration * 1000) / interval;

    // We will send a burst of commands. 
    // real implementation might want a server-side queue, but for now we loop here.
    for (let i = 0; i < steps; i++) {
      try {
        fetch('/api/drone/control', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'setpoint',
            roll,
            pitch,
            yaw,
            thrust
          })
        }).catch(e => console.error(e)); // Fire and forget
      } catch (e) {
        // ignore
      }
      await new Promise(r => setTimeout(r, interval));
    }
  }

  // Simulation State Tracking (Local to this execution run)
  const simState = useRef({ x: 0, y: 0, z: 0, yaw: 0 });

  const updateSim = (dx: number, dy: number, dz: number, dYaw: number, duration: number) => {
    // Interpolate for smooth animation? 
    // For now, let's just jump to final pos or simple steps.
    // Ideally we want to animate `setSimState` over `duration`.

    // Simple implementation: Teleport for now, or small steps
    const safeDuration = duration > 0 ? duration : 1;
    const steps = Math.floor(20 * safeDuration); // 20fps
    if (steps <= 0) return Promise.resolve(); // Safety check

    const stepDx = dx / steps;
    const stepDy = dy / steps;
    const stepDz = dz / steps;
    const stepDYaw = dYaw / steps;

    return new Promise<void>(resolve => {
      let count = 0;
      const intervalId = setInterval(() => {
        if (count >= steps) {
          clearInterval(intervalId);
          resolve();
          return;
        }

        simState.current.x += stepDx;
        simState.current.y += stepDy;
        simState.current.z += stepDz;
        simState.current.yaw += stepDYaw;

        setSimState({ ...simState.current });
        count++;
      }, 50); // 50ms interval = 20fps
    });
  }

  const handleExecute = async (mode: "simulate" | "drone" | "both") => {
    if (!code.trim()) {
      addConsoleOutput("error", "Error: No code to execute")
      return
    }

    onExecutionStart()
    const modeLabel = mode === "simulate" ? "SIMULATION" : mode === "drone" ? "REAL DRONE" : "SIMULATION + DRONE";
    addConsoleOutput("info", `Executing script in ${modeLabel} mode...`)

    // Reset Sim State
    simState.current = { x: 0, y: 0, z: 0, yaw: 0 };
    setSimState({ x: 0, y: 0, z: 0, yaw: 0 });

    const lines = code.split("\n").filter((line) => line.trim() && !line.trim().startsWith("#"))

    // 1. SYNTAX VALIDATION PASS
    let hasErrors = false;
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("#") || trimmed.length === 0) return;

      // Check for recognized patterns
      if (!trimmed.startsWith("drone.") && !trimmed.startsWith("print(")) {
        addConsoleOutput("error", `Line ${index + 1}: Unknown syntax '${trimmed}'. commands must start with 'drone.' or 'print('`);
        hasErrors = true;
        return;
      }

      if (trimmed.startsWith("drone.")) {
        // Check command validity
        const match = trimmed.match(/drone\.(\w+)(\((.*?)\))?/);
        if (!match) {
          addConsoleOutput("error", `Line ${index + 1}: Malformed command '${trimmed}'`);
          hasErrors = true;
          return;
        }
        const cmd = match[1];
        const allowedCommands = ["takeoff", "land", "forward", "backward", "left", "right", "up", "down", "rotate", "hover", "move_circular"];
        if (!allowedCommands.includes(cmd)) {
          addConsoleOutput("error", `Line ${index + 1}: Unknown drone command '${cmd}'`);
          hasErrors = true;
        }
      }
    });

    if (hasErrors) {
      addConsoleOutput("error", "Execution aborted due to syntax errors.");
      return; // Stop here
    }

    try {
      let commandCount = 0

      for (const line of lines) {
        const trimmed = line.trim()

        if (trimmed.startsWith("drone.")) {
          const match = trimmed.match(/drone\.(\w+)(\((.*?)\))?/)
          if (match) {
            const command = match[1]
            const paramsStr = match[3] || ""
            const params: Record<string, number> = {}

            paramsStr.split(",").forEach(p => {
              const parts = p.split("=");
              if (parts.length === 2) {
                const k = parts[0].trim();
                const v = parseFloat(parts[1].trim());
                if (!isNaN(v)) {
                  params[k] = v;
                }
              } else if (parts.length === 1 && parts[0].trim()) {
                // Try to support positional args if possible, or just default
                // For safety and strict simple understanding, let's stick to key=value or assume order for specific commands
                const v = parseFloat(parts[0].trim());
                if (!isNaN(v)) {
                  // Heuristic for simple commands like forward(10)
                  if (["forward", "backward", "left", "right", "up", "down"].includes(command)) params["distance"] = v;
                  else if (command === "hover") params["duration"] = v;
                  else if (command === "rotate") params["angle"] = v;
                }
              }
            })

            const duration = params.duration || 1;
            const speed = params.speed || 1;
            const angle = params.angle || 90;
            const distance = params.distance || 1;
            const height = params.height || 1; // Takeoff height in meters
            const radius = params.radius || 2; // For circular movement

            const HOVER_THRUST = 45000;

            commandCount++
            addConsoleOutput("output", `> ${trimmed}`)

            // EXECUTION: Based on mode
            const promises: Promise<void>[] = [];

            // API Promise (only if mode includes drone)
            if (mode === "drone" || mode === "both") {
              // Calculate move time same as simulation: time = distance / speed
              const moveTime = speed > 0 ? distance / speed : 1;

              const apiPromise = (async () => {
                switch (command) {
                  case "takeoff": {
                    // Adjustable takeoff: height affects thrust duration
                    const takeoffTime = height / 0.5; // ~0.5 m/s ascent rate
                    await sendCommand(0, 0, 0, 10000, 0.3);
                    await sendCommand(0, 0, 0, 55000, takeoffTime * 0.6);
                    await sendCommand(0, 0, 0, HOVER_THRUST, takeoffTime * 0.4);
                    break;
                  }
                  case "land": {
                    // Adjustable land: duration affects descent rate
                    const landDuration = duration > 0 ? duration : 2;
                    await sendCommand(0, 0, 0, 35000, landDuration * 0.5);
                    await sendCommand(0, 0, 0, 20000, landDuration * 0.4);
                    await sendCommand(0, 0, 0, 0, 0.1);
                    break;
                  }
                  case "forward": await sendCommand(0, -5 * speed, 0, HOVER_THRUST, moveTime); break;
                  case "backward": await sendCommand(0, 5 * speed, 0, HOVER_THRUST, moveTime); break;
                  case "left": await sendCommand(-5 * speed, 0, 0, HOVER_THRUST, moveTime); break;
                  case "right": await sendCommand(5 * speed, 0, 0, HOVER_THRUST, moveTime); break;
                  case "up": await sendCommand(0, 0, 0, HOVER_THRUST + 10000 * speed, moveTime); break;
                  case "down": await sendCommand(0, 0, 0, Math.max(HOVER_THRUST - 10000 * speed, 20000), moveTime); break;
                  case "rotate": await sendCommand(0, 0, angle * speed, HOVER_THRUST, duration); break;
                  case "hover": await sendCommand(0, 0, 0, HOVER_THRUST, duration); break;
                  case "move_circular": await sendCommand(0, -3 * speed, 20, HOVER_THRUST, duration); break;
                }
              })();
              promises.push(apiPromise);
            }

            // Simulation Promise (only if mode includes simulate)
            if (mode === "simulate" || mode === "both") {
              const simPromise = (async () => {
                // Get current yaw in radians for directional movement
                const yawRad = (simState.current.yaw * Math.PI) / 180;

                // Calculate actual move time: time = distance / speed
                // For movement commands, use distance/speed; for others use duration
                const moveTime = speed > 0 ? distance / speed : 1;

                switch (command) {
                  case "takeoff": {
                    // Adjustable takeoff height
                    const takeoffTime = height / 0.5; // ~0.5 m/s ascent rate
                    await updateSim(0, height, 0, 0, takeoffTime);
                    break;
                  }
                  case "land": {
                    // Adjustable land duration
                    const landDuration = duration > 0 ? duration : 2;
                    await updateSim(0, -simState.current.y, 0, 0, landDuration);
                    break;
                  }
                  case "forward": {
                    const dx = -Math.sin(yawRad) * distance;
                    const dz = -Math.cos(yawRad) * distance;
                    await updateSim(dx, 0, dz, 0, moveTime);
                    break;
                  }
                  case "backward": {
                    const dx = Math.sin(yawRad) * distance;
                    const dz = Math.cos(yawRad) * distance;
                    await updateSim(dx, 0, dz, 0, moveTime);
                    break;
                  }
                  case "left": {
                    const dx = -Math.cos(yawRad) * distance;
                    const dz = Math.sin(yawRad) * distance;
                    await updateSim(dx, 0, dz, 0, moveTime);
                    break;
                  }
                  case "right": {
                    const dx = Math.cos(yawRad) * distance;
                    const dz = -Math.sin(yawRad) * distance;
                    await updateSim(dx, 0, dz, 0, moveTime);
                    break;
                  }
                  case "up":
                    await updateSim(0, distance, 0, 0, moveTime);
                    break;
                  case "down":
                    await updateSim(0, -distance, 0, 0, moveTime);
                    break;
                  case "rotate":
                    // Rotate uses duration directly (not distance-based)
                    await updateSim(0, 0, 0, angle, duration);
                    break;
                  case "hover":
                    // Hover uses duration directly
                    await updateSim(0, 0, 0, 0, duration);
                    break;
                  case "move_circular":
                    await updateSim(0, 0, 0, 0, duration);
                    break;
                }
              })();
              promises.push(simPromise);
            }

            await Promise.all(promises);

            // Stabilization pause (only for real drone)
            if (mode === "drone" || mode === "both") {
              await sendCommand(0, 0, 0, HOVER_THRUST, 0.2);
            }
          }
        } else if (trimmed.startsWith("print(")) {
          const match = trimmed.match(/print\((.*?)\)/)
          if (match) {
            const message = match[1].replace(/["']/g, "")
            addConsoleOutput("success", `→ ${message}`)
            await new Promise(r => setTimeout(r, 100));
          }
        }
      }

      addConsoleOutput("success", `✓ Script executed: ${commandCount} drone commands`)

      // RTH logic
      if (simState.current) {
        const { x, y, z, yaw } = simState.current;
        if (Math.abs(x) > 0.1 || Math.abs(z) > 0.1 || y > 0.1) {
          addConsoleOutput("info", "Returning to home (Simulation)...");
          await new Promise(r => setTimeout(r, 1000));
          const RTH_ALTITUDE = 1.0;
          if (simState.current.y < RTH_ALTITUDE) await updateSim(0, RTH_ALTITUDE - simState.current.y, 0, 0, 1.0);
          if (Math.abs(simState.current.x) > 0.1) await updateSim(-simState.current.x, 0, 0, 0, 2.0);
          if (Math.abs(simState.current.z) > 0.1) await updateSim(0, 0, -simState.current.z, 0, 2.0);
          if (simState.current.y > 0) await updateSim(0, -simState.current.y, 0, 0, 2.0);
          const currentYaw = simState.current.yaw;
          if (Math.abs(currentYaw % 360) > 1) await updateSim(0, 0, 0, -currentYaw, 1.0);
          addConsoleOutput("success", "✓ Returned to home base");
        }
      }

    } catch (error) {
      addConsoleOutput("error", `Runtime Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      onExecutionEnd()
    }
  }

  const handleClear = () => {
    setCode("")
    addConsoleOutput("info", "Code editor cleared")
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const addConsoleOutput = (type: ConsoleOutput["type"], message: string) => {
    setConsoleOutput((prev) => [
      ...prev,
      {
        type,
        message,
        timestamp: new Date().toLocaleTimeString(),
      },
    ])
  }

  const loadExample = (example: string) => {
    const examples: Record<string, string> = {
      square: `# Square Flight Pattern
# Fly in a square by repeating forward + rotate
drone.takeoff()
drone.forward(distance=5, speed=1)
drone.rotate(angle=90, duration=1)
drone.forward(distance=5, speed=1)
drone.rotate(angle=90, duration=1)
drone.forward(distance=5, speed=1)
drone.rotate(angle=90, duration=1)
drone.forward(distance=5, speed=1)
drone.rotate(angle=90, duration=1)
drone.land()
print("Square pattern completed!")`,
      circle: `# Circle Flight
# Fly in a circle using small arcs (12 segments)
drone.takeoff()
drone.forward(distance=2, speed=1)
drone.rotate(angle=30, duration=0.5)
drone.forward(distance=2, speed=1)
drone.rotate(angle=30, duration=0.5)
drone.forward(distance=2, speed=1)
drone.rotate(angle=30, duration=0.5)
drone.forward(distance=2, speed=1)
drone.rotate(angle=30, duration=0.5)
drone.forward(distance=2, speed=1)
drone.rotate(angle=30, duration=0.5)
drone.forward(distance=2, speed=1)
drone.rotate(angle=30, duration=0.5)
drone.forward(distance=2, speed=1)
drone.rotate(angle=30, duration=0.5)
drone.forward(distance=2, speed=1)
drone.rotate(angle=30, duration=0.5)
drone.forward(distance=2, speed=1)
drone.rotate(angle=30, duration=0.5)
drone.forward(distance=2, speed=1)
drone.rotate(angle=30, duration=0.5)
drone.forward(distance=2, speed=1)
drone.rotate(angle=30, duration=0.5)
drone.forward(distance=2, speed=1)
drone.rotate(angle=30, duration=0.5)
drone.land()
print("Circle flight complete!")`,
      hover: `# Hover Test
# Takeoff, hover for a few seconds, then land
drone.takeoff()
drone.hover(duration=3)
print("Hovering steady...")
drone.hover(duration=2)
drone.land()
print("Hover test successful!")`,
      complex: `# Multi-action Sequence
# Combine multiple commands
drone.takeoff()
drone.forward(distance=10, speed=1)
drone.rotate(angle=180, duration=2)
drone.backward(distance=10, speed=1)
drone.hover(duration=2)
drone.land()
print("Complex sequence complete!")`,
    }
    setCode(examples[example] || "")
  }

  const droneAPI = [
    { cmd: "drone.takeoff(height=1)", desc: "Takeoff to specified height [height=meters, default=1]" },
    { cmd: "drone.land(duration=2)", desc: "Land safely [duration=seconds, controls descent speed]" },
    { cmd: "drone.forward(distance=X, speed=Y)", desc: "Move forward [distance=meters, speed=m/s]" },
    { cmd: "drone.backward(distance=X, speed=Y)", desc: "Move backward" },
    { cmd: "drone.left(distance=X, speed=Y)", desc: "Strafe left" },
    { cmd: "drone.right(distance=X, speed=Y)", desc: "Strafe right" },
    { cmd: "drone.up(distance=X, speed=Y)", desc: "Ascend [distance=meters]" },
    { cmd: "drone.down(distance=X, speed=Y)", desc: "Descend [distance=meters]" },
    { cmd: "drone.rotate(angle=90, duration=X)", desc: "Rotate [angle=degrees, duration=seconds]" },
    { cmd: "drone.hover(duration=5)", desc: "Hold position [duration=seconds]" },
    { cmd: "drone.move_circular(radius=X, speed=Y)", desc: "Fly in a circle [radius=meters]" },
  ]

  return (
    <div className="flex flex-col h-full gap-3 p-4">
      {/* Code Editor */}
      <Card className="flex-1 flex flex-col border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Write Your Drone Script</CardTitle>
              <CardDescription>Program drone behaviors using Python</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                disabled={!code.trim() || isExecutingCode}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Clear
              </Button>
              <Button
                size="sm"
                onClick={() => handleExecute("simulate")}
                disabled={isExecutingCode || !code.trim()}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Play className="w-4 h-4" />
                Simulate
              </Button>
              <Button
                size="sm"
                onClick={() => handleExecute("drone")}
                disabled={isExecutingCode || isFlying || !code.trim()}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Rocket className="w-4 h-4" />
                Fly Drone
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCopyCode} className="gap-1" disabled={!code.trim()}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col gap-3">
          {/* Code Input Area */}
          <div className="flex-1 border border-border rounded-md overflow-hidden bg-card">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full p-3 bg-card text-foreground font-mono text-sm resize-none focus:outline-none border-0"
              placeholder="Enter Python code here..."
              spellCheck="false"
              disabled={isExecutingCode}
            />
          </div>

          {/* Learning Examples */}
          <div className="bg-muted/50 rounded-md p-3 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              Try These Examples:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadExample("square")}
                className="text-xs"
                disabled={isExecutingCode}
              >
                Square Flight
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadExample("circle")}
                className="text-xs"
                disabled={isExecutingCode}
              >
                Circle Flight
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadExample("hover")}
                className="text-xs"
                disabled={isExecutingCode}
              >
                Hover Pattern
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadExample("complex")}
                className="text-xs"
                disabled={isExecutingCode}
              >
                Sequence
              </Button>
            </div>
          </div>

          {/* Drone API Reference */}
          <div className="bg-card border border-border rounded-md p-3 max-h-40 overflow-y-auto">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Drone Commands Available:</p>
            <div className="space-y-1">
              {droneAPI.map((api, idx) => (
                <div key={idx} className="text-xs">
                  <code className="text-cyan-400 font-mono">{api.cmd}</code>
                  <span className="text-muted-foreground ml-2">- {api.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Control Buttons */}

          {isFlying && (
            <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 p-2 rounded border border-amber-500/30">
              <AlertCircle className="w-4 h-4" />
              Land drone manually before running scripts
            </div>
          )}
        </CardContent>
      </Card>

      {/* Terminal Console */}
      <Card className="flex-1 flex flex-col border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Console Output</CardTitle>
              <CardDescription>Script execution logs and results</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setConsoleOutput([
                  { type: "info", message: "Console cleared", timestamp: new Date().toLocaleTimeString() },
                ])
              }
              className="text-xs"
            >
              Clear
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 border border-border rounded-md bg-card/50 overflow-y-auto p-3 space-y-1 font-mono text-xs">
            {consoleOutput.length === 0 ? (
              <div className="text-muted-foreground">Waiting for output...</div>
            ) : (
              consoleOutput.map((output, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2 ${output.type === "error"
                    ? "text-red-400"
                    : output.type === "success"
                      ? "text-emerald-400"
                      : output.type === "warning"
                        ? "text-amber-400"
                        : output.type === "info"
                          ? "text-blue-400"
                          : "text-foreground/80"
                    }`}
                >
                  <span className="text-muted-foreground opacity-50">[{output.timestamp}]</span>
                  <span className="flex-1 break-words">{output.message}</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
