"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback } from "react"

interface JoystickPosition {
    horizontal: number
    vertical: number
}

export function VirtualJoysticks({
    onLeftChange,
    onRightChange,
}: {
    onLeftChange: (values: JoystickPosition) => void
    onRightChange: (values: JoystickPosition) => void
}) {
    const leftCanvasRef = useRef<HTMLCanvasElement>(null)
    const rightCanvasRef = useRef<HTMLCanvasElement>(null)
    const [leftPos, setLeftPos] = useState({ x: 0, y: 0 })
    const [rightPos, setRightPos] = useState({ x: 0, y: 0 })
    const [joystickSize, setJoystickSize] = useState(240)

    const INNER_RADIUS = 30
    const OUTER_RADIUS = 100

    useEffect(() => {
        const updateSize = () => {
            const screenWidth = window.innerWidth
            const screenHeight = window.innerHeight
            let size = 240

            // Enhanced sizing logic for tablets and landscape orientation
            if (screenWidth < 640) {
                // Mobile: xs-sm
                size = Math.min(160, screenHeight * 0.25)
            } else if (screenWidth < 768) {
                // Mobile landscape / small tablet
                size = Math.min(180, screenHeight * 0.3)
            } else if (screenWidth < 1024) {
                // Tablet: md-lg
                size = Math.min(220, screenHeight * 0.35)
            } else {
                // Desktop: xl+
                size = Math.min(240, screenHeight * 0.4)
            }
            setJoystickSize(size)
        }

        updateSize()
        window.addEventListener("resize", updateSize)
        return () => window.removeEventListener("resize", updateSize)
    }, [])

    // Draw joystick
    const drawJoystick = useCallback((canvas: HTMLCanvasElement, thumbX: number, thumbY: number, icons: string[]) => {
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const dpr = window.devicePixelRatio || 1
        canvas.width = joystickSize * dpr
        canvas.height = joystickSize * dpr
        ctx.scale(dpr, dpr)

        const centerX = joystickSize / 2
        const centerY = joystickSize / 2

        // Clear canvas (transparent background)
        ctx.clearRect(0, 0, joystickSize, joystickSize)

        // Draw outer ring glow
        ctx.shadowBlur = 15
        ctx.shadowColor = "rgba(59, 130, 246, 0.3)"

        // Draw outer circle background
        const outerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, OUTER_RADIUS)
        outerGradient.addColorStop(0, "rgba(255, 255, 255, 0.02)")
        outerGradient.addColorStop(0.8, "rgba(255, 255, 255, 0.05)")
        outerGradient.addColorStop(1, "rgba(255, 255, 255, 0.02)")

        ctx.fillStyle = outerGradient
        ctx.beginPath()
        ctx.arc(centerX, centerY, OUTER_RADIUS, 0, Math.PI * 2)
        ctx.fill()

        // Draw outer ring border (neon)
        ctx.strokeStyle = "rgba(59, 130, 246, 0.4)"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(centerX, centerY, OUTER_RADIUS, 0, Math.PI * 2)
        ctx.stroke()

        ctx.strokeStyle = "rgba(59, 130, 246, 0.1)"
        ctx.lineWidth = 8
        ctx.beginPath()
        ctx.arc(centerX, centerY, OUTER_RADIUS, 0, Math.PI * 2)
        ctx.stroke()

        // Draw axis indicators
        ctx.shadowBlur = 0
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)"
        ctx.font = "bold 10px Inter, sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        const iconOffset = OUTER_RADIUS - 15
        ctx.fillText(icons[0], centerX, centerY - iconOffset)
        ctx.fillText(icons[1], centerX, centerY + iconOffset)
        ctx.fillText(icons[2], centerX - iconOffset, centerY)
        ctx.fillText(icons[3], centerX + iconOffset, centerY)

        // Draw crosshair lines
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)"
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(centerX - OUTER_RADIUS, centerY)
        ctx.lineTo(centerX + OUTER_RADIUS, centerY)
        ctx.moveTo(centerX, centerY - OUTER_RADIUS)
        ctx.lineTo(centerX, centerY + OUTER_RADIUS)
        ctx.stroke()

        // Draw inner thumb (The Stick)
        const thumbCenterX = centerX + thumbX
        const thumbCenterY = centerY + thumbY

        // Stick Glow
        ctx.shadowBlur = 20
        ctx.shadowColor = "rgba(59, 130, 246, 0.6)"

        // Outer Thumb Ring
        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(thumbCenterX, thumbCenterY, INNER_RADIUS, 0, Math.PI * 2)
        ctx.stroke()

        // Inner Thumb Fill
        const sphereGradient = ctx.createRadialGradient(
            thumbCenterX - 5,
            thumbCenterY - 5,
            0,
            thumbCenterX,
            thumbCenterY,
            INNER_RADIUS,
        )
        sphereGradient.addColorStop(0, "rgba(59, 130, 246, 0.9)")
        sphereGradient.addColorStop(1, "rgba(29, 78, 216, 0.9)")

        ctx.fillStyle = sphereGradient
        ctx.shadowBlur = 0
        ctx.beginPath()
        ctx.arc(thumbCenterX, thumbCenterY, INNER_RADIUS - 2, 0, Math.PI * 2)
        ctx.fill()

        // Lens flare / highlight
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
        ctx.beginPath()
        ctx.arc(thumbCenterX - 6, thumbCenterY - 6, 6, 0, Math.PI * 2)
        ctx.fill()
    }, [joystickSize])

    // Handle touch/mouse events
    const handlePointerEvent = (e: React.PointerEvent<HTMLCanvasElement>, isLeft: boolean) => {
        const canvas = isLeft ? leftCanvasRef.current : rightCanvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        const centerX = rect.width / 2
        const centerY = rect.height / 2

        let x = e.clientX - rect.left - centerX
        let y = e.clientY - rect.top - centerY

        // Constrain to circle
        const distance = Math.sqrt(x * x + y * y)
        if (distance > OUTER_RADIUS) {
            x = (x / distance) * OUTER_RADIUS
            y = (y / distance) * OUTER_RADIUS
        }

        if (isLeft) {
            setLeftPos({ x, y })
            onLeftChange({
                horizontal: x / OUTER_RADIUS,
                vertical: -y / OUTER_RADIUS,
            })
        } else {
            setRightPos({ x, y })
            onRightChange({
                horizontal: x / OUTER_RADIUS,
                vertical: -y / OUTER_RADIUS,
            })
        }
    }

    const handlePointerUp = (isLeft: boolean) => {
        if (isLeft) {
            setLeftPos({ x: 0, y: 0 })
            onLeftChange({ horizontal: 0, vertical: 0 })
        } else {
            setRightPos({ x: 0, y: 0 })
            onRightChange({ horizontal: 0, vertical: 0 })
        }
    }

    // Redraw on position change
    useEffect(() => {
        if (leftCanvasRef.current) {
            drawJoystick(leftCanvasRef.current, leftPos.x, leftPos.y, ["▲", "▼", "◄", "►"])
        }
    }, [leftPos, joystickSize, drawJoystick])

    useEffect(() => {
        if (rightCanvasRef.current) {
            drawJoystick(rightCanvasRef.current, rightPos.x, rightPos.y, ["▲", "▼", "◄", "►"])
        }
    }, [rightPos, joystickSize, drawJoystick])

    const displaySize = joystickSize

    return (
        <div className="w-full h-full flex items-center justify-center px-0.5 sm:px-1">
            <div className="flex items-center justify-between gap-1 sm:gap-2 md:gap-4 lg:gap-8 h-full">
                {/* Left Joystick */}
                <div className="flex flex-col items-center gap-0.5 sm:gap-1 md:gap-2">
                    {/* Improved canvas rendering for better responsiveness */}
                    <canvas
                        ref={leftCanvasRef}
                        className="cursor-grab active:cursor-grabbing touch-none"
                        width={joystickSize}
                        height={joystickSize}
                        style={{ width: `${displaySize}px`, height: `${displaySize}px` }}
                        onPointerMove={(e) => e.buttons && handlePointerEvent(e, true)}
                        onPointerDown={(e) => handlePointerEvent(e, true)}
                        onPointerUp={() => handlePointerUp(true)}
                        onPointerLeave={() => handlePointerUp(true)}
                    />
                    <span
                        className="text-[6px] sm:text-[7px] md:text-[8px] lg:text-[10px] font-mono text-primary text-center leading-tight drop-shadow-lg whitespace-nowrap"
                        style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
                    >
                        THROTTLE & YAW
                    </span>
                </div>

                {/* Right Joystick */}
                <div className="flex flex-col items-center gap-0.5 sm:gap-1 md:gap-2">
                    <canvas
                        ref={rightCanvasRef}
                        className="cursor-grab active:cursor-grabbing touch-none"
                        width={joystickSize}
                        height={joystickSize}
                        style={{ width: `${displaySize}px`, height: `${displaySize}px` }}
                        onPointerMove={(e) => e.buttons && handlePointerEvent(e, false)}
                        onPointerDown={(e) => handlePointerEvent(e, false)}
                        onPointerUp={() => handlePointerUp(false)}
                        onPointerLeave={() => handlePointerUp(false)}
                    />
                    <span
                        className="text-[6px] sm:text-[7px] md:text-[8px] lg:text-[10px] font-mono text-primary text-center leading-tight drop-shadow-lg whitespace-nowrap"
                        style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
                    >
                        PITCH & ROLL
                    </span>
                </div>
            </div>
        </div>
    )
}
