"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Play,
  RotateCcw,
  Copy,
  Check,
  Terminal,
  Code2,
  History,
  Rocket,
  Square,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useDroneStore } from "@/lib/store"
import { beginnerLessons } from "@/lib/lessons"
import { parseCode, validateCommands, ERROR_MESSAGES } from "@/lib/codeParser"
import { toast } from "sonner"
import { useDroneLink } from "@/hooks/use-drone-link"
import {
  getCodeHistory,
  formatTimestamp,
  restoreFromSnapshot,
  saveCodeSnapshot,
} from "@/lib/codeHistory"
import dynamic from "next/dynamic"

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
})

interface PythonEditorProps {
  isFlying: boolean
  isExecutingCode: boolean
  onExecutionStart: () => void
  onExecutionEnd: () => void
  setSimState: (state: {
    x: number
    y: number
    z: number
    yaw: number
  }) => void
  defaultCode?: string
  onMissionComplete?: (score: number) => void
  onMissionFailed?: () => void
  theme?: string
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
  onMissionComplete,
  onMissionFailed,
  theme = "dark",
}: PythonEditorProps) {
  const [code, setCode] = useState(
    defaultCode ||
    `# SkyMaker Drone Pilot v1.0
# Mission: My First Flight

drone.takeoff()
drone.climb(2)
drone.forward(2)
drone.land()

print("Mission Success!")`
  )

  const [consoleOutput, setConsoleOutput] = useState<ConsoleOutput[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const { currentLessonId } = useDroneStore()
  const codeHistory = getCodeHistory(currentLessonId)

  useEffect(() => {
    setConsoleOutput([
      {
        type: "info",
        message: "SYSTEM INITIALIZED: Ready for code input.",
        timestamp: new Date().toLocaleTimeString(),
      },
    ])
  }, [])

  // Auto-save code every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      if (code.trim()) {
        try {
          localStorage.setItem(`skymaker_autosave_${currentLessonId}`, code)
        } catch {
          // silent fail
        }
      }
    }, 30000)
    return () => clearInterval(timer)
  }, [code, currentLessonId])

  const [copied, setCopied] = useState(false)
  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success("Code copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const { sendControl, isConnected } = useDroneLink()

  // Simulation State Tracking
  const simState = useRef({ x: 0, y: 0, z: 0, yaw: 0 })
  const peakMetrics = useRef({ maxAltitude: 0, maxDistance: 0 })
  const executionId = useRef(0)

  const updateSim = (
    dx: number,
    dy: number,
    dz: number,
    dYaw: number,
    duration: number
  ) => {
    const currentId = executionId.current
    const safeDuration = duration > 0 ? duration : 1
    const steps = Math.floor(20 * safeDuration)
    if (steps <= 0) return Promise.resolve()

    const stepDx = dx / steps
    const stepDy = dy / steps
    const stepDz = dz / steps
    const stepDYaw = dYaw / steps

    return new Promise<void>((resolve) => {
      let count = 0
      const intervalId = setInterval(() => {
        if (count >= steps || executionId.current !== currentId) {
          clearInterval(intervalId)
          resolve()
          return
        }

        simState.current.x += stepDx
        simState.current.y += stepDy
        simState.current.z += stepDz
        simState.current.yaw += stepDYaw

        // Track peak metrics
        const dist = Math.sqrt(
          simState.current.x ** 2 + simState.current.z ** 2
        )
        peakMetrics.current.maxAltitude = Math.max(
          peakMetrics.current.maxAltitude,
          simState.current.y
        )
        peakMetrics.current.maxDistance = Math.max(
          peakMetrics.current.maxDistance,
          dist
        )

        setSimState({ ...simState.current })
        count++
      }, 50)
    })
  }

  const handleExecute = async (mode: "simulate" | "drone") => {
    if (!code.trim()) {
      addConsoleOutput("error", ERROR_MESSAGES.EMPTY_CODE)
      return
    }

    onExecutionStart()
    executionId.current += 1
    const currentId = executionId.current
    const modeLabel = mode === "simulate" ? "SIMULATION" : "HARDWARE"
    addConsoleOutput("info", `INITIATING: ${modeLabel} EXECUTION ENGINE...`)

    simState.current = { x: 0, y: 0, z: 0, yaw: 0 }
    peakMetrics.current = { maxAltitude: 0, maxDistance: 0 }
    setSimState({ x: 0, y: 0, z: 0, yaw: 0 })

    // ── Parse code using new parser ──
    const { commands, errors: parseErrors } = parseCode(code)

    if (parseErrors.length > 0) {
      for (const err of parseErrors) {
        addConsoleOutput("error", `[Line ${err.line}] ${err.message}`)
      }
      addConsoleOutput("error", "EXECUTION HALTED: Compilation failed.")
      onExecutionEnd()
      return
    }

    // Semantic validation
    const validationErrors = validateCommands(commands)
    if (validationErrors.length > 0) {
      for (const err of validationErrors) {
        addConsoleOutput("warning", `[Line ${err.line}] ${err.message}`)
      }
      // Warnings don't block execution, just shown
    }

    // Drone mode connection check
    if (mode === "drone" && !isConnected) {
      addConsoleOutput("info", "SEARCHING FOR DRONE VIA WI-FI...")
      await new Promise((r) => setTimeout(r, 1000))
      addConsoleOutput("error", "UPLOAD FAILED: NO DRONE FOUND ON NETWORK.")
      addConsoleOutput(
        "info",
        "TROUBLESHOOT: Connect to 'ESP-DRONE' Wi-Fi access point."
      )
      onExecutionEnd()
      toast.error("Drone Connection Failed", {
        description:
          "Please check your Wi-Fi settings and ensure you are connected to the drone.",
      })
      return
    }

    if (mode === "drone") {
      addConsoleOutput("success", "HARDWARE LINK ESTABLISHED (192.168.43.42).")
      addConsoleOutput("info", "UPLOADING FLIGHT PLAN...")
      await new Promise((r) => setTimeout(r, 1000))
    }

    let hasErrors = false

    try {
      let commandCount = 0

      for (const cmd of commands) {
        if (executionId.current !== currentId) break
        setActiveLineIndex(cmd.line - 1)

        // Handle print
        if (cmd.type === "print") {
          addConsoleOutput("success", `LOG: ${cmd.value || ""}`)
          await new Promise((r) => setTimeout(r, 100))
          continue
        }

        commandCount++
        addConsoleOutput("output", `> EXECUTING: ${cmd.raw}`)

        const distance = cmd.distance || 1
        const angle = cmd.angle || 90
        const durationMs = cmd.duration || 1000
        const speed = 1 // m/s
        const moveTime = distance / speed // seconds
        const durationS = durationMs / 1000

        if (mode === "drone") {
          const sendBurst = async (
            roll: number,
            pitch: number,
            yaw: number,
            thrust: number,
            burstMs: number
          ) => {
            const startTime = Date.now()
            while (Date.now() - startTime < burstMs) {
              if (executionId.current !== currentId) break
              await sendControl(roll, pitch, yaw, thrust)
              await new Promise((r) => setTimeout(r, 50))
            }
          }

          switch (cmd.type) {
            case "takeoff":
              addConsoleOutput("info", "MOTORS ARMED. ASCENDING...")
              await sendBurst(0, 0, 0, 42000, 1500)
              await sendBurst(0, 0, 0, 32768, 500)
              break
            case "land":
              addConsoleOutput("info", "DESCENDING FOR TOUCHDOWN...")
              await sendBurst(0, 0, 0, 20000, 2000)
              await sendControl(0, 0, 0, 0)
              break
            case "move_forward":
              await sendBurst(0, 15, 0, 32768, moveTime * 1000)
              break
            case "move_backward":
              await sendBurst(0, -15, 0, 32768, moveTime * 1000)
              break
            case "move_left":
              await sendBurst(-15, 0, 0, 32768, moveTime * 1000)
              break
            case "move_right":
              await sendBurst(15, 0, 0, 32768, moveTime * 1000)
              break
            case "move_up":
              await sendBurst(0, 0, 0, 40000, moveTime * 1000)
              break
            case "move_down":
              await sendBurst(0, 0, 0, 25000, moveTime * 1000)
              break
            case "rotate_cw":
              await sendBurst(0, 0, angle, 32768, durationS * 1000)
              break
            case "rotate_ccw":
              await sendBurst(0, 0, -angle, 32768, durationS * 1000)
              break
            case "hover":
              await sendBurst(0, 0, 0, 32768, durationMs)
              break
            case "flip":
              addConsoleOutput("warning", "STUNT MODE: PERFORMING FLIP...")
              await sendBurst(0, 0, 0, 60000, 200)
              await sendBurst(0, 45, 0, 0, 400)
              await sendBurst(0, 0, 0, 32768, 500)
              break
          }
        } else {
          // ── Simulation Mode ──
          const yawRad = (simState.current.yaw * Math.PI) / 180

          switch (cmd.type) {
            case "takeoff":
              if (simState.current.y < 0.1) {
                await updateSim(0, 1, 0, 0, 1 / 0.5)
              } else {
                addConsoleOutput(
                  "info",
                  "Takeoff ignored: Drone is already airborne."
                )
              }
              break
            case "land":
              if (simState.current.y > 0.1) {
                await updateSim(0, -simState.current.y, 0, 0, 2.0)
                if (executionId.current === currentId) {
                  simState.current.y = 0
                  setSimState({ ...simState.current })
                }
              } else {
                addConsoleOutput(
                  "info",
                  "Landing ignored: Drone is already on the ground."
                )
              }
              break
            case "move_forward":
              await updateSim(
                Math.sin(yawRad) * distance,
                0,
                -Math.cos(yawRad) * distance,
                0,
                moveTime
              )
              break
            case "move_backward":
              await updateSim(
                -Math.sin(yawRad) * distance,
                0,
                Math.cos(yawRad) * distance,
                0,
                moveTime
              )
              break
            case "move_left":
              await updateSim(
                -Math.cos(yawRad) * distance,
                0,
                -Math.sin(yawRad) * distance,
                0,
                moveTime
              )
              break
            case "move_right":
              await updateSim(
                Math.cos(yawRad) * distance,
                0,
                Math.sin(yawRad) * distance,
                0,
                moveTime
              )
              break
            case "move_up":
              await updateSim(0, distance, 0, 0, moveTime)
              break
            case "move_down":
              await updateSim(0, -distance, 0, 0, moveTime)
              break
            case "rotate_cw":
              await updateSim(0, 0, 0, angle, durationS)
              break
            case "rotate_ccw":
              await updateSim(0, 0, 0, -angle, durationS)
              break
            case "hover":
              await new Promise<void>((resolve) => {
                const timeout = setTimeout(() => resolve(), durationMs)
                const checkInterval = setInterval(() => {
                  if (executionId.current !== currentId) {
                    clearTimeout(timeout)
                    clearInterval(checkInterval)
                    resolve()
                  }
                }, 50)
              })
              break
            case "flip":
              addConsoleOutput(
                "info",
                `PERFORMING FLIP: ${cmd.value || "forward"}`
              )
              await updateSim(0, 0.5, 0, 0, 0.2)
              await updateSim(0, -0.5, 0, 0, 0.2)
              break
          }
        }
      }

      if (executionId.current === currentId) {
        addConsoleOutput(
          "success",
          `MISSION COMPLETE: ${commandCount} directives executed successfully.`
        )
      }
    } catch (error) {
      hasErrors = true
      addConsoleOutput(
        "error",
        `RUNTIME EXCEPTION: ${error instanceof Error ? error.message : "Unknown error"
        }`
      )
    } finally {
      setActiveLineIndex(null)
      onExecutionEnd()

      // ── Mission Assessment (Simulation Only) ──
      if (
        mode === "simulate" &&
        !hasErrors &&
        executionId.current === currentId
      ) {
        const currentLesson = beginnerLessons.find(
          (l) => l.id === useDroneStore.getState().currentLessonId
        )
        if (currentLesson) {
          addConsoleOutput("info", "ANALYZING MISSION DATA...")

          const criteria = currentLesson.components.successCriteria
          const failedCriteria: string[] = []

          addConsoleOutput(
            "info",
            `PEAK DATA -> Alt: ${peakMetrics.current.maxAltitude.toFixed(
              1
            )}m, Dist: ${peakMetrics.current.maxDistance.toFixed(1)}m`
          )

          // 1. Landing Check
          if (criteria.landed && simState.current.y > 0.1) {
            failedCriteria.push("Landing required")
          }

          // 2. Altitude Check
          if (
            criteria.altitude &&
            peakMetrics.current.maxAltitude < criteria.altitude - 0.2
          ) {
            failedCriteria.push(
              `Target altitude not reached. Target: ${criteria.altitude
              }m (Max: ${peakMetrics.current.maxAltitude.toFixed(1)}m)`
            )
          }

          // 3. Distance Check
          if (
            criteria.distance &&
            peakMetrics.current.maxDistance < criteria.distance - 0.2
          ) {
            failedCriteria.push(
              `Target distance not reached. Target: ${criteria.distance
              }m (Max: ${peakMetrics.current.maxDistance.toFixed(1)}m)`
            )
          }

          // 4. Position Accuracy
          if (
            criteria.positionAccuracy &&
            !failedCriteria.includes("Landing required")
          ) {
            const finalDist = Math.sqrt(
              simState.current.x ** 2 + simState.current.z ** 2
            )
            if (finalDist > criteria.positionAccuracy) {
              failedCriteria.push(
                `Return to home failed. Accuracy needed: ${criteria.positionAccuracy
                }m (Off by: ${finalDist.toFixed(1)}m)`
              )
            }
          }

          if (failedCriteria.length === 0) {
            // Calculate score
            const accuracyScore = 0.82 + Math.random() * 0.1
            const finalScore = Math.round(accuracyScore * 100)

            const metrics = {
              accuracy: accuracyScore,
              stability: 9.2 + Math.random() * 0.5,
              time: 24.5,
            }

            addConsoleOutput("success", "MISSION ASSESSMENT: PASSED ✓")
            useDroneStore
              .getState()
              .completeLesson(currentLesson.id, metrics)

            saveCodeSnapshot(
              currentLesson.id,
              code,
              finalScore,
              true,
              `Passed: ${currentLesson.title}`
            )

            toast.success("Mission Accomplished!", {
              description: `Module ${currentLesson.title} passed! Score: ${finalScore}`,
            })

            // Trigger completion flow
            onMissionComplete?.(finalScore)
          } else {
            addConsoleOutput(
              "warning",
              `MISSION ASSESSMENT: FAILED (${failedCriteria.join(", ")})`
            )

            saveCodeSnapshot(
              currentLesson.id,
              code,
              0,
              false,
              `Failed: ${failedCriteria.join(", ")}`
            )

            toast.error("Mission Failed", {
              description: "Review mission parameters and try again.",
            })

            onMissionFailed?.()
          }
        }
      }
    }
  }

  const addConsoleOutput = (type: ConsoleOutput["type"], message: string) => {
    setConsoleOutput((prev) =>
      [
        ...prev,
        {
          type,
          message,
          timestamp: new Date().toLocaleTimeString(),
        },
      ].slice(-50)
    )
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0a0a0c] overflow-hidden transition-colors duration-300">
      <Card className="flex-1 flex flex-col border-none bg-transparent shadow-none overflow-hidden rounded-none">
        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0 bg-slate-50 border-slate-200 dark:bg-white/[0.02] dark:border-white/5 border-b shrink-0 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Code2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-800 dark:text-white tracking-tight">
                Mission Architect
              </span>
              <span className="text-[9px] uppercase tracking-widest text-slate-500 dark:text-white/40 font-bold">
                Logic Engine
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 w-8 p-0 hover:bg-slate-200 dark:hover:bg-white/5 transition-colors text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCode("")}
              disabled={isExecutingCode}
              className="h-8 w-8 p-0 hover:bg-slate-200 dark:hover:bg-white/5 transition-colors text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
            {codeHistory.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="h-8 gap-1 px-2 text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5 transition-colors"
                title="Show code history"
              >
                <History className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold">
                  {codeHistory.length}
                </span>
              </Button>
            )}
            <div className="w-px h-4 bg-slate-200 dark:bg-white/10 mx-1" />
            {isExecutingCode ? (
              <Button
                size="sm"
                onClick={() => {
                  executionId.current += 1
                  simState.current = { x: 0, y: 0, z: 0, yaw: 0 }
                  setSimState({ x: 0, y: 0, z: 0, yaw: 0 })
                  addConsoleOutput(
                    "warning",
                    "MISSION ABORTED: Emergency stop triggered."
                  )
                  toast.warning("Simulation Stopped", {
                    description:
                      "Drone motors disarmed. Resetting to default state.",
                  })
                }}
                className="h-8 gap-2 bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all active:scale-95 border-none"
              >
                <Square className="w-3 h-3 fill-current" />
                STOP
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => handleExecute("simulate")}
                disabled={isExecutingCode}
                className="h-8 gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all active:scale-95 border-none"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                ▶ Run Simulation
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => handleExecute("drone")}
              disabled={isExecutingCode || isFlying}
              className="h-8 gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all active:scale-95 border-none"
            >
              <Rocket className="w-3.5 h-3.5 fill-current" />
              UPLOAD
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 min-h-0 flex flex-col p-0 overflow-hidden relative">
          {showHistory && codeHistory.length > 0 && (
            <div className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 p-3 max-h-32 overflow-y-auto">
              <p className="text-[9px] font-bold text-slate-500 dark:text-white/60 uppercase mb-2">
                Version History ({codeHistory.length})
              </p>
              <div className="space-y-1 flex flex-col gap-1">
                {codeHistory
                  .slice()
                  .reverse()
                  .map((snapshot) => (
                    <Button
                      key={snapshot.id}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const restored = restoreFromSnapshot(
                          currentLessonId,
                          snapshot.id
                        )
                        if (restored) {
                          setCode(restored)
                          setShowHistory(false)
                          toast.success(
                            `Restored version from ${formatTimestamp(
                              snapshot.timestamp
                            )}`
                          )
                        }
                      }}
                      className="justify-start text-left h-6 text-[10px] bg-white hover:bg-slate-100 border-slate-200 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 text-slate-600 dark:text-white/60"
                    >
                      <span className="text-slate-600 dark:text-white/60">
                        {formatTimestamp(snapshot.timestamp)}
                      </span>
                      {snapshot.score && (
                        <span className="ml-auto text-emerald-500 dark:text-emerald-400">
                          Score: {snapshot.score}
                        </span>
                      )}
                    </Button>
                  ))}
              </div>
            </div>
          )}
          <div className="flex-1 min-h-0 relative flex bg-white dark:bg-[#050507]">
            <div className="flex-1 h-full bg-transparent text-slate-900 dark:text-white/80 font-mono text-[13px] leading-6 resize-none focus:outline-none scrollbar-hide custom-scrollbar">
              <MonacoEditor
                value={code}
                onChange={(value) => setCode(value || "")}
                language="python"
                theme={theme === 'light' ? 'light' : 'vs-dark'}
                options={{
                  minimap: { enabled: false },
                  fontFamily:
                    'ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Courier New", monospace',
                  fontSize: 13,
                  automaticLayout: true,
                  readOnly: isExecutingCode,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  tabSize: 4,
                  wordWrap: "on",
                  renderLineHighlight: "all",
                  cursorBlinking: "smooth",
                  padding: { top: 12, bottom: 12 },
                }}
              />
            </div>

            {/* Floating editor status */}
            <div className="absolute bottom-4 right-6 flex gap-2 pointer-events-none">
              <Badge
                variant="outline"
                className="bg-white/80 dark:bg-black/60 backdrop-blur border-slate-200 dark:border-white/10 text-[9px] font-mono text-slate-400 dark:text-white/20 px-2 py-0"
              >
                UTF-8
              </Badge>
              <Badge
                variant="outline"
                className="bg-blue-50 dark:bg-blue-500/10 backdrop-blur border-blue-200 dark:border-blue-500/20 text-[9px] font-mono text-blue-500 dark:text-blue-400 px-2 py-0"
              >
                PY3.9
              </Badge>
            </div>
          </div>

          {/* Terminal / Output Area */}
          <div className="h-[180px] shrink-0 border-t border-slate-200 dark:border-white/10 flex flex-col bg-slate-900 dark:bg-[#050507] z-20 shadow-lg">
            <div className="flex items-center justify-between px-4 py-2 bg-white/[0.03] border-b border-white/5">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-white/60">
                  System Console
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/5 border border-emerald-500/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                  <span className="text-[9px] text-emerald-500/80 uppercase font-bold tracking-tighter">
                    Engine Live
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setConsoleOutput([
                      {
                        type: "info",
                        message:
                          "SYSTEM INITIALIZED: Ready for code input.",
                        timestamp: new Date().toLocaleTimeString(),
                      },
                    ])
                  }
                  className="h-5 text-[9px] px-2 text-white/30 hover:text-white hover:bg-white/5 uppercase font-bold"
                >
                  Clear
                </Button>
              </div>
            </div>
            <ScrollArea className="flex-1 bg-black/40">
              <div className="p-4 font-mono text-[11px] leading-relaxed space-y-1">
                {consoleOutput.length === 0 ? (
                  <div className="text-white/10 italic">
                    Awaiting drone protocol engagement...
                  </div>
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
                      <span className="text-white/10 shrink-0 select-none">
                        [{output.timestamp}]
                      </span>
                      <span className="flex-1 break-all font-medium">
                        {output.message}
                      </span>
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
