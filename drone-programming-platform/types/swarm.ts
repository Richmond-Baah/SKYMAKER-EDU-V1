// Multi-drone choreography types for Phase 3

export interface DroneConfig {
  id: number
  name: string
  color: string // hex color for 3D visualization
  initialPosition: { x: number; y: number; z: number }
  role?: 'leader' | 'follower' | 'solo'
}

export interface SwarmState {
  drones: DroneConfig[]
  isActive: boolean
  startTime: number
  telemetry: Record<number, DroneTelemetry>
}

export interface DroneTelemetry {
  droneId: number
  position: { x: number; y: number; z: number }
  velocity: { x: number; y: number; z: number }
  orientation: { pitch: number; roll: number; yaw: number }
  battery: number // 0-100
  altitude: number
  timestamp: number
  status: 'idle' | 'flying' | 'error' | 'emergency_stop'
}

export interface SwarmCommand {
  type: 'formation' | 'choreography' | 'individual'
  droneIds: number[]
  command: string // serialized code command
  expectedDuration: number // milliseconds
}

// Helper to spawn multiple drones
export function createSwarm(droneCount: number, baseColor = '#00FFFF'): DroneConfig[] {
  return Array.from({ length: droneCount }, (_, i) => ({
    id: i + 1,
    name: `Drone ${i + 1}`,
    color: adjustBrightness(baseColor, i * (100 / droneCount)),
    initialPosition: {
      x: i * 0.5 - ((droneCount - 1) * 0.5) / 2, // spread horizontally
      y: 0,
      z: 0,
    },
    role: i === 0 ? 'leader' : 'follower',
  }))
}

// Utility: adjust color brightness for visual distinction
function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.min(255, (num >> 16) + amt)
  const G = Math.min(255, (num >> 8 & 0x00FF) + amt)
  const B = Math.min(255, (num & 0x0000FF) + amt)
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)
}

// Default telemetry 
export function createDefaultTelemetry(droneId: number): DroneTelemetry {
  return {
    droneId,
    position: { x: 0, y: 0, z: 0 },
    velocity: { x: 0, y: 0, z: 0 },
    orientation: { pitch: 0, roll: 0, yaw: 0 },
    battery: 100,
    altitude: 0,
    timestamp: Date.now(),
    status: 'idle',
  }
}
