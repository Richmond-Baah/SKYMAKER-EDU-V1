"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface JoystickControlProps {
  isFlying: boolean
  onTaskStart: () => void
}

export default function JoystickControl({ isFlying }: JoystickControlProps) {
  const [stick1Pos, setStick1Pos] = useState({ x: 0, y: 0 })
  const [stick2Pos, setStick2Pos] = useState({ x: 0, y: 0 })
  const [activeStick, setActiveStick] = useState<1 | 2 | null>(null)
  const stick1Ref = useRef<HTMLDivElement>(null)
  const stick2Ref = useRef<HTMLDivElement>(null)
  const lastSentRef = useRef<number>(0)

  const DEAD_ZONE = 8
  const MAX_DISTANCE = 60

  const sendCommand = useCallback(async (roll: number, pitch: number, yaw: number, thrust: number) => {
    const now = Date.now()
    if (now - lastSentRef.current < 50) return; // Cap at ~20Hz
    lastSentRef.current = now;

    try {
      await fetch('/api/drone/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'setpoint',
          roll,
          pitch,
          yaw,
          thrust
        })
      })
    } catch (e) {
      console.error("Failed to send command", e)
    }
  }, [])

  useEffect(() => {
    if (!isFlying) return;

    // Mapping:
    // Stick 1 Left (Yaw/Throttle): X=Yaw, Y=Throttle
    // Stick 2 Right (Roll/Pitch): X=Roll, Y=Pitch

    // Normalize to:
    // Roll/Pitch: -30 to 30 degrees
    // Yaw: -200 to 200 deg/s
    // Throttle: 0 to 60000 (approx uint16)

    // Note: Y axis in browser is positive down, but usually Up is positive throttle/pitch forward. 
    // We need to invert Y input.

    const normThrottle = Math.max(0, Math.min(60000, 30000 - (stick1Pos.y / MAX_DISTANCE) * 30000 + 30000)); // Map -MAX..MAX to 0..60000?? No, stick centers at 0.
    // Let's assume center is hovering point? 
    // Actually for throttle, usually down is 0. But here it's a spring loaded stick? 
    // If spring loaded, center is 50% throttle? Let's assume that for now.
    // If the stick is not spring loaded on Y (like real transmitters), that's different. But on screen it behaves like spring.
    // Let's map center to 30000.

    const throttle = Math.floor(Math.max(0, Math.min(65535, 32767 - (stick1Pos.y / MAX_DISTANCE) * 32767)));
    const yaw = (stick1Pos.x / MAX_DISTANCE) * 200;

    const roll = (stick2Pos.x / MAX_DISTANCE) * 30;
    const pitch = -(stick2Pos.y / MAX_DISTANCE) * 30; // Invert Y so Up is positive pitching forward

    sendCommand(roll, pitch, yaw, throttle);

  }, [stick1Pos, stick2Pos, isFlying, sendCommand])

  const updateStickPosition = (stick: 1 | 2, clientX: number, clientY: number) => {
    const ref = stick === 1 ? stick1Ref : stick2Ref
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    let x = clientX - centerX
    let y = clientY - centerY

    const distance = Math.sqrt(x * x + y * y)

    // Apply dead zone
    if (distance < DEAD_ZONE) {
      x = 0
      y = 0
    } else {
      // Constrain to max distance
      const constrainedDistance = Math.min(distance, MAX_DISTANCE)
      const angle = Math.atan2(y, x)
      x = Math.cos(angle) * constrainedDistance
      y = Math.sin(angle) * constrainedDistance
    }

    if (stick === 1) {
      setStick1Pos({ x, y })
    } else {
      setStick2Pos({ x, y })
    }
  }

  const handleMouseDown = (stick: 1 | 2) => () => {
    setActiveStick(stick)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (activeStick) {
        updateStickPosition(activeStick, e.clientX, e.clientY)
      }
    }

    const handleMouseUp = () => {
      setActiveStick(null)
      // Return joysticks to center
      setStick1Pos({ x: 0, y: 0 })
      setStick2Pos({ x: 0, y: 0 })
    }

    if (activeStick) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [activeStick])

  const normalizeValue = (value: number) => {
    return Math.round((value / MAX_DISTANCE) * 100)
  }

  return (
    <div className="flex flex-col h-full overflow-auto p-6 gap-6">
      <div className="flex gap-6 flex-1">
        {/* Left Joystick - Throttle & Yaw */}
        <Card className="flex-1 border-border">
          <CardHeader>
            <CardTitle className="text-lg">Throttle & Yaw</CardTitle>
            <CardDescription>Up/Down: Altitude | Left/Right: Rotation</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div
              ref={stick1Ref}
              className="relative w-40 h-40 bg-gradient-to-b from-muted to-muted-foreground/10 border-2 border-border rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-inner"
              onMouseDown={handleMouseDown(1)}
            >
              {/* Center dot */}
              <div className="absolute w-2 h-2 bg-border rounded-full z-10 pointer-events-none" />

              {/* Dead zone indicator */}
              <div className="absolute w-16 h-16 border border-border/30 rounded-full pointer-events-none" />

              {/* Stick knob */}
              <div
                className="absolute w-8 h-8 bg-cyan-500 rounded-full shadow-lg shadow-cyan-500/50 transition-all pointer-events-none"
                style={{
                  transform: `translate(${stick1Pos.x}px, ${stick1Pos.y}px)`,
                  left: "50%",
                  top: "50%",
                  marginLeft: "-16px",
                  marginTop: "-16px",
                }}
              />

              {/* Outer boundary */}
              <div className="absolute w-32 h-32 border border-border/50 rounded-full pointer-events-none" />
            </div>
            <div className="text-center text-sm space-y-1 font-mono">
              <div>Throttle (Y): {normalizeValue(-stick1Pos.y)}%</div>
              <div>Yaw (X): {normalizeValue(stick1Pos.x)}%</div>
              <div className="text-xs text-muted-foreground">{isFlying ? "Ready" : "Arm drone to control"}</div>
            </div>
          </CardContent>
        </Card>

        {/* Right Joystick - Roll & Pitch */}
        <Card className="flex-1 border-border">
          <CardHeader>
            <CardTitle className="text-lg">Roll & Pitch</CardTitle>
            <CardDescription>Left/Right: Roll | Up/Down: Pitch</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div
              ref={stick2Ref}
              className="relative w-40 h-40 bg-gradient-to-b from-muted to-muted-foreground/10 border-2 border-border rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-inner"
              onMouseDown={handleMouseDown(2)}
            >
              {/* Center dot */}
              <div className="absolute w-2 h-2 bg-border rounded-full z-10 pointer-events-none" />

              {/* Dead zone indicator */}
              <div className="absolute w-16 h-16 border border-border/30 rounded-full pointer-events-none" />

              {/* Stick knob */}
              <div
                className="absolute w-8 h-8 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50 transition-all pointer-events-none"
                style={{
                  transform: `translate(${stick2Pos.x}px, ${stick2Pos.y}px)`,
                  left: "50%",
                  top: "50%",
                  marginLeft: "-16px",
                  marginTop: "-16px",
                }}
              />

              {/* Outer boundary */}
              <div className="absolute w-32 h-32 border border-border/50 rounded-full pointer-events-none" />
            </div>
            <div className="text-center text-sm space-y-1 font-mono">
              <div>Pitch (Y): {normalizeValue(-stick2Pos.y)}%</div>
              <div>Roll (X): {normalizeValue(stick2Pos.x)}%</div>
              <div className="text-xs text-muted-foreground">{isFlying ? "Ready" : "Arm drone to control"}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Educational Info Section */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Flight Control Guide</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="font-semibold text-cyan-500">Left Stick (Mode 2)</div>
            <ul className="text-muted-foreground space-y-1 text-xs">
              <li>• Up: Increase Altitude</li>
              <li>• Down: Decrease Altitude</li>
              <li>• Left: Rotate CCW</li>
              <li>• Right: Rotate CW</li>
            </ul>
          </div>
          <div className="space-y-2">
            <div className="font-semibold text-blue-500">Right Stick (Mode 2)</div>
            <ul className="text-muted-foreground space-y-1 text-xs">
              <li>• Up: Pitch Forward</li>
              <li>• Down: Pitch Backward</li>
              <li>• Left: Roll Left</li>
              <li>• Right: Roll Right</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
