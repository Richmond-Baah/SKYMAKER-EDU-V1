"use client"

import { useState, useEffect, useCallback, useRef } from "react"

export interface TelemetryData {
    battery: number
    altitude: number
    roll: number
    pitch: number
    yaw: number
    vbat: number
    connected: boolean
    timestamp: number
}

export function useDroneLink() {
    const [telemetry, setTelemetry] = useState<TelemetryData | null>(null)
    const [isConnecting, setIsConnecting] = useState(false)
    const lastCommandTime = useRef(0)

    const fetchTelemetry = useCallback(async () => {
        try {
            const res = await fetch("/api/drone/telemetry")
            if (res.ok) {
                const data = await res.json()
                setTelemetry(data)
            } else {
                setTelemetry(prev => prev ? { ...prev, connected: false } : null)
            }
        } catch (error) {
            setTelemetry(prev => prev ? { ...prev, connected: false } : null)
        }
    }, [])

    useEffect(() => {
        const interval = setInterval(fetchTelemetry, 1000)
        fetchTelemetry()
        return () => clearInterval(interval)
    }, [fetchTelemetry])

    const sendControl = useCallback(async (roll: number, pitch: number, yaw: number, thrust: number) => {
        // Basic rate limiting to 50ms (20Hz)
        const now = Date.now()
        if (now - lastCommandTime.current < 50) return
        lastCommandTime.current = now

        try {
            await fetch("/api/drone/control", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "setpoint",
                    roll,
                    pitch,
                    yaw,
                    thrust: Math.round(thrust)
                })
            })
        } catch (error) {
            console.error("Failed to send control command:", error)
        }
    }, [])

    const requestTelemetryRefresh = useCallback(async () => {
        try {
            await fetch("/api/drone/telemetry", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "requestTelemetry" })
            })
        } catch (error) {
            console.error("Failed to request telemetry:", error)
        }
    }, [])

    return {
        telemetry,
        sendControl,
        requestTelemetryRefresh,
        isConnected: telemetry?.connected || false
    }
}
