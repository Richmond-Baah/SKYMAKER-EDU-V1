"use client"

import { useRef, useEffect, useState } from "react"
import { VirtualJoysticks } from "@/components/virtual-joysticks"
import { StatusBar } from "@/components/status-bar"
import { ActionButtons } from "@/components/action-buttons"
import { SettingsPanel } from "@/components/settings-panel"
import { FlightModesPanel } from "@/components/flight-modes-panel"
import { DroneMeshBackground } from "@/components/drone-mesh-background"
import { useDroneLink } from "@/hooks/use-drone-link"
import { toast } from "sonner"

type View = "main" | "settings" | "flight-modes" | "takeoff"

export default function DroneControllerApp() {
  const [view, setView] = useState<View>("main")
  const { telemetry, sendControl, isConnected } = useDroneLink()

  const [joystickValues, setJoystickValues] = useState({
    left: { vertical: 0, horizontal: 0 },
    right: { horizontal: 0, vertical: 0 },
  })

  // Sync joystick values to actual drone hardware
  useEffect(() => {
    if (!isConnected) return

    // Mapping joystick (-1 to 1) to CRTP setpoints
    // Pitch/Roll usually +/- 30 degrees for stabilized flight
    // Yaw usually +/- 200 degrees/sec
    // Thrust usually 0 to 60000 (depending on battery)

    const pitch = joystickValues.right.vertical * 20; // 20 deg max
    const roll = joystickValues.right.horizontal * 20; // 20 deg max
    const yaw = -joystickValues.left.horizontal * 150; // 150 deg/s max
    const thrust = (joystickValues.left.vertical + 1) * 30000; // 0 to 60000

    sendControl(roll, pitch, yaw, Math.max(0, thrust));
  }, [joystickValues, isConnected, sendControl])

  const droneDisplayData = {
    battery: telemetry?.battery ?? 0,
    wifiSignal: isConnected,
    bluetoothSignal: false,
    speed: 0.0, // Calculated or from flow deck if available
    height: telemetry?.altitude ?? 0.0,
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <DroneMeshBackground />

      <div className="relative z-10 flex flex-col h-screen w-screen">
        {/* Status Bar - Minimal and Clean */}
        <StatusBar data={droneDisplayData} />

        {/* Main Control Area - improved responsive with landscape support */}
        <div className="flex-1 flex flex-col items-center justify-center px-1 sm:px-2 md:px-4 py-1 sm:py-2 md:py-3 gap-1 sm:gap-2 md:gap-3 w-full overflow-hidden">
          {/* Top Action Buttons */}
          <ActionButtons onNavigate={setView} />

          {/* Content based on current view */}
          {view === "main" && (
            <>
              {/* Virtual Joysticks - Main focal point */}
              <div className="flex-1 w-full flex items-center justify-center min-h-0">
                <VirtualJoysticks
                  onLeftChange={(values) => setJoystickValues((prev: any) => ({ ...prev, left: values }))}
                  onRightChange={(values) => setJoystickValues((prev: any) => ({ ...prev, right: values }))}
                />
              </div>
            </>
          )}

          {view === "settings" && (
            <div className="flex-1 w-full overflow-auto max-h-full">
              <SettingsPanel onBack={() => setView("main")} />
            </div>
          )}

          {view === "flight-modes" && (
            <div className="flex-1 w-full overflow-auto max-h-full">
              <FlightModesPanel onBack={() => setView("main")} />
            </div>
          )}

          {view === "takeoff" && (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 sm:gap-3 md:gap-4">
              <div className="text-center">
                <h2 className="text-base sm:text-lg md:text-2xl font-bold text-primary mb-1 sm:mb-2">
                  TAKEOFF & LANDING
                </h2>
                <p className="text-[11px] sm:text-sm md:text-base text-foreground/60 mb-2 sm:mb-4">
                  Use throttle to control altitude
                </p>
              </div>
              <button
                onClick={() => setView("main")}
                className="px-3 sm:px-6 py-1.5 sm:py-2 bg-primary text-background font-bold text-[11px] sm:text-base rounded hover:opacity-90 transition-opacity"
              >
                BACK
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
