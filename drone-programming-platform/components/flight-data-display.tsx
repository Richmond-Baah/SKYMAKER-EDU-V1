"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface FlightData {
  altitude: number
  speed: number
  battery: number
  temperature: number
  gps: { latitude: number; longitude: number }
  yaw: number
  timeElapsed: number
}

export default function FlightDataDisplay({ flightData }: { flightData: FlightData }) {
  const getBatteryColor = (battery: number) => {
    if (battery > 50) return "text-emerald-500"
    if (battery > 20) return "text-yellow-500"
    return "text-red-500"
  }

  const getTempColor = (temp: number) => {
    if (temp > 50) return "text-red-500"
    if (temp > 35) return "text-yellow-500"
    return "text-emerald-500"
  }

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  return (
    <div className="p-4 space-y-4">
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Real-Time Data</CardTitle>
          <CardDescription>Live flight telemetry</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Altitude</span>
            <div className="text-right">
              <div className="font-mono font-bold">{flightData.altitude.toFixed(1)}m</div>
              <div className="text-xs text-muted-foreground">AGL</div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Speed</span>
            <div className="text-right">
              <div className="font-mono font-bold">{flightData.speed.toFixed(1)}m/s</div>
              <div className="text-xs text-muted-foreground">{(flightData.speed * 3.6).toFixed(1)} km/h</div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Battery</span>
            <div className={`text-right ${getBatteryColor(flightData.battery)}`}>
              <div className="font-mono font-bold">{flightData.battery.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Voltage OK</div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Yaw</span>
            <div className="text-right">
              <div className="font-mono font-bold">{flightData.yaw.toFixed(0)}°</div>
              <div className="text-xs text-muted-foreground">Heading</div>
            </div>
          </div>

          <div className="border-t border-border pt-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Temperature</span>
              <div className={getTempColor(flightData.temperature)}>
                <div className="font-mono font-bold">{flightData.temperature.toFixed(1)}°C</div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Flight Time</span>
            <div className="font-mono font-bold text-cyan-500">{formatTime(flightData.timeElapsed)}</div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">GPS Position</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <span className="text-muted-foreground">Latitude</span>
            <div className="font-mono text-xs mt-1">{flightData.gps.latitude.toFixed(6)}°</div>
          </div>
          <div>
            <span className="text-muted-foreground">Longitude</span>
            <div className="font-mono text-xs mt-1">{flightData.gps.longitude.toFixed(6)}°</div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Sensors Online</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>GPS Lock</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>IMU Calibrated</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Comms Active</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
