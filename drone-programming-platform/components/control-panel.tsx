"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ControlPanelProps {
  isFlying: boolean
  onTakeoff: () => void
  onLand: () => void
  isExecutingCode: boolean
}

export default function ControlPanel({
  isFlying,
  onTakeoff,
  onLand,
  isExecutingCode,
}: ControlPanelProps) {
  return (
    <div className="p-4 space-y-4">
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Flight Control</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            onClick={onTakeoff}
            disabled={isFlying || isExecutingCode}
          >
            Takeoff
          </Button>
          <Button
            className="w-full bg-red-600 hover:bg-red-700"
            onClick={onLand}
            disabled={!isFlying && !isExecutingCode}
          >
            Land
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">System Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">State:</span>
            <span className="font-mono">{isFlying || isExecutingCode ? "ACTIVE" : "IDLE"}</span>
          </div>

          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground italic">Learn by coding and experimenting!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
