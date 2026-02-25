"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Play } from 'lucide-react'
import { toast } from 'sonner'
import { DroneConfig, createSwarm, SwarmState, createDefaultTelemetry } from '@/types/swarm'

interface SwarmEditorProps {
  onSwarmStart?: (state: SwarmState) => void
}

export function SwarmEditor({ onSwarmStart }: SwarmEditorProps) {
  const [droneCount, setDroneCount] = useState(2)
  const [drones, setDrones] = useState<DroneConfig[]>(createSwarm(2))
  const [swarmCode, setSwarmCode] = useState(`# Swarm Programming Example
# Define drones
drone1 = Drone(id=1, color="#FF0000")  # Red
drone2 = Drone(id=2, color="#00FF00")  # Green

# Formation: Take off together
drone1.takeoff()
drone2.takeoff()

# Flying formation: move together
for i in range(5):
    drone1.move_forward(1)
    drone2.move_forward(1)
    wait(0.5)

# Choreography: cross pattern
drone1.move_right(2)
drone2.move_left(2)
wait(1)

# Land
drone1.land()
drone2.land()
`)

  function handleDroneCountChange(newCount: number) {
    if (newCount < 1 || newCount > 10) {
      toast.error('Swarm size must be 1-10 drones')
      return
    }
    setDroneCount(newCount)
    setDrones(createSwarm(newCount))
  }

  function updateDrone(id: number, updates: Partial<DroneConfig>) {
    setDrones(ds => ds.map(d => (d.id === id ? { ...d, ...updates } : d)))
  }

  function handleStartSwarm() {
    if (!swarmCode.trim()) {
      toast.error('Enter swarm code')
      return
    }

    const swarmState: SwarmState = {
      drones,
      isActive: true,
      startTime: Date.now(),
      telemetry: Object.fromEntries(
        drones.map(d => [d.id, createDefaultTelemetry(d.id)])
      ),
    }

    onSwarmStart?.(swarmState)
    toast.success(`Started swarm with ${drones.length} drones`)
  }

  return (
    <div className="space-y-6">
      {/* Swarm Configuration */}
      <Card className="glass border-cyan-500/20 bg-cyan-600/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <span>🚁 Swarm Configuration</span>
            <Badge variant="outline">{droneCount} drones</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase text-white/60">Number of Drones</label>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                min="1"
                max="10"
                value={droneCount}
                onChange={e => handleDroneCountChange(parseInt(e.target.value) || 1)}
                className="w-24"
              />
              <span className="text-xs text-white/40">1-10 drones per swarm</span>
            </div>
          </div>

          {/* Drone List */}
          <div className="space-y-2 max-h-48 overflow-auto">
            <div className="text-sm font-bold uppercase text-white/60">Drones</div>
            {drones.map(drone => (
              <div key={drone.id} className="flex gap-2 p-3 bg-white/3 rounded items-center">
                <div
                  className="w-4 h-4 rounded-full border-2 border-white"
                  style={{ backgroundColor: drone.color }}
                />
                <div className="flex-1 space-y-1">
                  <Input
                    placeholder="Drone name"
                    value={drone.name}
                    onChange={e => updateDrone(drone.id, { name: e.target.value })}
                    className="text-xs h-7"
                  />
                  <div className="text-xs text-white/40">ID: {drone.id} | Role: {drone.role}</div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDrones(ds => ds.filter(d => d.id !== drone.id))}
                  className="h-7 text-white/40 hover:text-red-400"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Swarm Code Editor */}
      <Card className="glass border-cyan-500/20">
        <CardHeader className="pb-3">
          <CardTitle>Swarm Code (Python)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={swarmCode}
            onChange={e => setSwarmCode(e.target.value)}
            placeholder="Enter swarm choreography code..."
            className="font-mono h-64 text-xs"
          />
          <Button onClick={handleStartSwarm} className="w-full gap-2" size="lg">
            <Play className="w-4 h-4" />
            Start Swarm Simulation
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
