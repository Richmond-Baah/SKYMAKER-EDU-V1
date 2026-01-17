"use client"

import { useState, useEffect, useRef } from "react"
import Header from "@/components/header"
import ControlPanel from "@/components/control-panel"
import FlightDataDisplay from "@/components/flight-data-display"
import PythonEditor from "@/components/python-editor"
import { useToast } from "@/hooks/use-toast"
import dynamic from "next/dynamic"

const SimulationWindow = dynamic(() => import("@/components/simulation-window"), { ssr: false })

export default function DronePlatform() {
  const [droneStatus, setDroneStatus] = useState("ready")
  const [isFlying, setIsFlying] = useState(false)
  const [isExecutingCode, setIsExecutingCode] = useState(false)
  const [simState, setSimState] = useState({ x: 0, y: 0, z: 0, yaw: 0 })
  const [flightData, setFlightData] = useState({
    altitude: 0,
    speed: 0,
    battery: 100,
    temperature: 22,
    gps: { latitude: 0, longitude: 0 },
    yaw: 0,
    timeElapsed: 0,
  })
  const { toast } = useToast()
  const dataIntervalRef = useRef<NodeJS.Timeout>(null)
  const [droneConnected, setDroneConnected] = useState(false)

  useEffect(() => {
    // Sync flight data with Sim State (simulation is always visible)
    setFlightData(prev => ({
      ...prev,
      altitude: simState.y,
      yaw: simState.yaw,
    }))
  }, [simState])

  // Poll real telemetry from drone
  useEffect(() => {
    const pollTelemetry = async () => {
      try {
        const res = await fetch('/api/drone/telemetry');
        if (res.ok) {
          const data = await res.json();
          setDroneConnected(data.connected);

          if (data.connected) {
            // Use real drone data when connected
            // NOTE: In strict programming mode, we might prefer sim data mostly, 
            // but for battery/temp we use real data.
            setFlightData(prev => ({
              ...prev,
              battery: data.battery || prev.battery,
              temperature: 22 + (data.vbat ? (data.vbat - 3.7) * 5 : 0),
            }));
          }
        }
      } catch (e) {
        setDroneConnected(false);
      }
    };

    // Poll every second when flying or executing
    if (isFlying || isExecutingCode) {
      dataIntervalRef.current = setInterval(() => {
        pollTelemetry();

        // Update time elapsed
        setFlightData(prev => ({
          ...prev,
          timeElapsed: prev.timeElapsed + 1,
        }));
      }, 1000);
    }

    return () => {
      if (dataIntervalRef.current) clearInterval(dataIntervalRef.current)
    }
  }, [isFlying, isExecutingCode])

  const handleTakeoff = () => {
    setIsFlying(true)
    setDroneStatus("flying")
    toast({ title: "Drone taking off", description: "Manual control active" })
  }

  const handleLand = () => {
    setIsFlying(false)
    setDroneStatus("landed")
    setFlightData((prev) => ({ ...prev, altitude: 0, speed: 0, timeElapsed: 0 }))
    toast({ title: "Drone landed", description: "All systems nominal" })
  }

  const handleCodeExecutionStart = () => {
    setIsExecutingCode(true)
    setDroneStatus("executing script")
    toast({ title: "Script executing", description: "Running your Python code with simulation" })
  }

  const handleCodeExecutionEnd = () => {
    setIsExecutingCode(false)
    setDroneStatus("script complete")
    setFlightData((prev) => ({ ...prev, altitude: 0, speed: 0, timeElapsed: 0 }))
    toast({ title: "Script complete", description: "Done" })
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header droneStatus={droneStatus} />

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Controls */}
        <div className="w-1/4 border-r border-border bg-card/50 overflow-y-auto">
          <ControlPanel
            isFlying={isFlying}
            onTakeoff={handleTakeoff}
            onLand={handleLand}
            isExecutingCode={isExecutingCode}
          />
        </div>

        {/* Center Panel - Main Control Area */}
        <div className="flex-1 flex flex-col relative">
          <div className="flex flex-col h-full w-full">
            {/* Simulation on top */}
            <div className="h-1/2 min-h-0 border-b border-border relative z-0">
              <SimulationWindow position={simState} yaw={simState.yaw} />
            </div>
            {/* Code Editor below */}
            <div className="h-1/2 overflow-auto">
              <PythonEditor
                isFlying={isFlying}
                isExecutingCode={isExecutingCode}
                onExecutionStart={handleCodeExecutionStart}
                onExecutionEnd={handleCodeExecutionEnd}
                setSimState={setSimState}
              />
            </div>
          </div>
        </div>

        {/* Right Panel - Flight Data */}
        <div className="w-1/4 border-l border-border bg-card/50 overflow-y-auto">
          <FlightDataDisplay flightData={flightData} />
        </div>
      </div>
    </div>
  )
}
