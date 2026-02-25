// Hardware drone connection framework for Phase 3

export type DroneHardwareType = 'dji_tello' | 'parrot_mambo' | 'esp32_custom' | 'simulator'

export interface HardwareDroneInfo {
  type: DroneHardwareType
  serialNumber: string
  firmwareVersion: string
  maxFlightTime: number // minutes
  maxSpeed: number // m/s
  maxAltitude: number // meters
  supportedConnections: ConnectionType[]
}

export type ConnectionType = 'wifi' | 'bluetooth' | 'usb'

export interface DroneConnectionConfig {
  type: DroneHardwareType
  connectionType: ConnectionType
  address?: string // IP or MAC address
  port?: number
  credentials?: {
    ssid?: string
    password?: string
  }
}

export interface ConnectionStatus {
  connected: boolean
  droneId?: string
  signal: number // 0-100
  latency: number // ms
  battery: number // 0-100
  lastUpdate: number // timestamp
  error?: string
}

export interface PreFlightCheck {
  propellersChecked: boolean
  obstaclesClear: boolean
  batteryOk: boolean // > 30%
  gpsReady: boolean // if outdoor
  compassCalibrated: boolean
  startEnginesOk: boolean
}

export interface SafetyLimits {
  maxAltitude: number // meters
  maxSpeed: number // m/s
  maxDistance: number // meters from home
  geofenceEnabled: boolean
  emergencyStopEnabled: boolean
  autoLandOnSignalLoss: boolean
}

export interface DroneCommand {
  id: string
  type: 'takeoff' | 'land' | 'move' | 'rotate' | 'set_speed' | 'set_altitude' | 'stop'
  params?: Record<string, any>
  timestamp: number
  status: 'pending' | 'sent' | 'executing' | 'complete' | 'failed'
}

// Hardware connection service interface (to be implemented)
export interface IDroneHardwareService {
  // Discovery
  scanForDrones(): Promise<HardwareDroneInfo[]>
  
  // Connection
  connect(config: DroneConnectionConfig): Promise<ConnectionStatus>
  disconnect(): Promise<void>
  getStatus(): ConnectionStatus
  
  // Pre-flight
  runPreFlightCheck(): Promise<PreFlightCheck>
  setSafetyLimits(limits: SafetyLimits): Promise<void>
  getSafetyLimits(): SafetyLimits
  
  // Commands
  sendCommand(cmd: DroneCommand): Promise<void>
  emergencyStop(): Promise<void>
  
  // Monitoring
  onTelemetry(callback: (data: any) => void): () => void
  onError(callback: (error: Error) => void): () => void
}

// Placeholder stub for now (real implementation in separate file)
export class MockDroneHardwareService implements IDroneHardwareService {
  private connected = false
  private telemetryCallbacks: Array<(data: any) => void> = []
  private errorCallbacks: Array<(error: Error) => void> = []

  async scanForDrones(): Promise<HardwareDroneInfo[]> {
    return []
  }

  async connect(_config: DroneConnectionConfig): Promise<ConnectionStatus> {
    this.connected = true
    return {
      connected: true,
      signal: 75,
      latency: 25,
      battery: 85,
      lastUpdate: Date.now(),
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false
  }

  getStatus(): ConnectionStatus {
    return {
      connected: this.connected,
      signal: 75,
      latency: 25,
      battery: 85,
      lastUpdate: Date.now(),
    }
  }

  async runPreFlightCheck(): Promise<PreFlightCheck> {
    return {
      propellersChecked: true,
      obstaclesClear: true,
      batteryOk: true,
      gpsReady: false,
      compassCalibrated: true,
      startEnginesOk: true,
    }
  }

  async setSafetyLimits(_limits: SafetyLimits): Promise<void> {}

  getSafetyLimits(): SafetyLimits {
    return {
      maxAltitude: 100,
      maxSpeed: 20,
      maxDistance: 500,
      geofenceEnabled: true,
      emergencyStopEnabled: true,
      autoLandOnSignalLoss: true,
    }
  }

  async sendCommand(_cmd: DroneCommand): Promise<void> {}

  async emergencyStop(): Promise<void> {
    this.errorCallbacks.forEach(cb => cb(new Error('Emergency stop triggered')))
  }

  onTelemetry(callback: (data: any) => void): () => void {
    this.telemetryCallbacks.push(callback)
    return () => {
      this.telemetryCallbacks = this.telemetryCallbacks.filter(c => c !== callback)
    }
  }

  onError(callback: (error: Error) => void): () => void {
    this.errorCallbacks.push(callback)
    return () => {
      this.errorCallbacks = this.errorCallbacks.filter(c => c !== callback)
    }
  }
}
