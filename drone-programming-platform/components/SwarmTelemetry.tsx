"use client"

import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { DroneTelemetry, SwarmState } from '@/types/swarm'
import { AlertCircle, Zap, Navigation, Compass } from 'lucide-react'

interface SwarmTelemetryProps {
  swarmState: SwarmState | null
}

export function SwarmTelemetry({ swarmState }: SwarmTelemetryProps) {
  const telemetryArray = useMemo(() => {
    if (!swarmState || !swarmState.telemetry) return []
    return Object.values(swarmState.telemetry)
  }, [swarmState?.telemetry])

  const avgBattery = useMemo(() => {
    if (telemetryArray.length === 0) return 0
    return Math.round(telemetryArray.reduce((sum, t) => sum + t.battery, 0) / telemetryArray.length)
  }, [telemetryArray])

  const avgAltitude = useMemo(() => {
    if (telemetryArray.length === 0) return 0
    return Math.round(telemetryArray.reduce((sum, t) => sum + t.altitude, 0) / telemetryArray.length * 100) / 100
  }, [telemetryArray])

  if (!swarmState || !swarmState.isActive) {
    return (
      <Card className="glass border-white/10">
        <CardContent className="p-6 text-center text-white/40">
          No active swarm — start a simulation to view telemetry
        </CardContent>
      </Card>
    )
  }

  const anyEmergency = telemetryArray.some(t => t.status === 'emergency_stop')

  return (
    <div className="space-y-4">
      {/* Swarm Overview */}
      <Card className="glass border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span>🚁 Swarm Telemetry</span>
            {anyEmergency && (
              <Badge className="bg-red-500/20 text-red-400 gap-1">
                <AlertCircle className="w-3 h-3" /> Emergency
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-white/3 rounded">
              <div className="text-xs text-white/40 uppercase tracking-wider">Avg Battery</div>
              <div className="text-xl font-bold text-emerald-400 mt-1">{avgBattery}%</div>
              <Progress value={avgBattery} className="mt-2 h-1" />
            </div>
            <div className="p-3 bg-white/3 rounded">
              <div className="text-xs text-white/40 uppercase tracking-wider">Avg Altitude</div>
              <div className="text-xl font-bold text-cyan-400 mt-1">{avgAltitude}m</div>
            </div>
            <div className="p-3 bg-white/3 rounded">
              <div className="text-xs text-white/40 uppercase tracking-wider">Active Drones</div>
              <div className="text-xl font-bold text-blue-400 mt-1">
                {telemetryArray.filter(t => t.status === 'flying').length}/{telemetryArray.length}
              </div>
            </div>
          </div>

          {/* Individual Drone Telemetry */}
          <div className="space-y-2 max-h-64 overflow-auto">
            <div className="text-sm font-bold uppercase text-white/60 sticky top-0 bg-black/30 p-1">
              Individual Drones
            </div>
            {telemetryArray.map(telem => (
              <DroneTelemetryRow key={telem.droneId} telemetry={telem} swarmDrone={swarmState.drones.find(d => d.id === telem.droneId)} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface DroneTelemetryRowProps {
  telemetry: DroneTelemetry
  swarmDrone?: { color: string; name: string }
}

function DroneTelemetryRow({ telemetry, swarmDrone }: DroneTelemetryRowProps) {
  const statusColor = {
    idle: 'text-white/40',
    flying: 'text-blue-400',
    error: 'text-red-400',
    emergency_stop: 'text-red-600',
  }[telemetry.status]

  return (
    <div className="p-3 bg-white/3 rounded border border-white/5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {swarmDrone && (
            <div
              className="w-3 h-3 rounded-full border border-white"
              style={{ backgroundColor: swarmDrone.color }}
            />
          )}
          <span className="font-bold text-sm">{swarmDrone?.name || `Drone ${telemetry.droneId}`}</span>
          <Badge variant="outline" className={`text-xs capitalize ${statusColor}`}>
            {telemetry.status}
          </Badge>
        </div>
        <span className="text-xs text-white/40">{new Date(telemetry.timestamp).toLocaleTimeString()}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-emerald-400" />
          <span className="text-white/60">Battery:</span>
          <span className="font-bold text-emerald-400">{telemetry.battery}%</span>
        </div>
        <div className="flex items-center gap-1">
          <Navigation className="w-3 h-3 text-cyan-400" />
          <span className="text-white/60">Alt:</span>
          <span className="font-bold text-cyan-400">{telemetry.altitude.toFixed(2)}m</span>
        </div>
        <div className="text-white/60">
          Pos: <span className="font-mono text-blue-400">{telemetry.position.x.toFixed(1)}, {telemetry.position.y.toFixed(1)}, {telemetry.position.z.toFixed(1)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Compass className="w-3 h-3 text-purple-400" />
          <span className="text-white/60">Yaw:</span>
          <span className="font-bold text-purple-400">{telemetry.orientation.yaw.toFixed(0)}°</span>
        </div>
      </div>
    </div>
  )
}
