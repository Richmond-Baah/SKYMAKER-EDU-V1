"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { toast } from "sonner"

export function SettingsPanel({ onBack }: { onBack: () => void }) {
    const [settings, setSettings] = useState({
        wifiSSID: "DRONE_5G_FPV",
        wifiChannel: "2.4GHz / Channel 6",
        autoReconnect: true,
        maxAltitude: 120,
        maxDistance: 500,
        returnToHome: true,
        beginnerMode: false,
        controlMode: "MODE 2",
        hapticFeedback: true,
        audioAlerts: true,
    })

    const [editingField, setEditingField] = useState<string | null>(null)
    const [tempValue, setTempValue] = useState("")

    const handleEdit = (field: string, value: string) => {
        setEditingField(field)
        setTempValue(value)
    }

    const handleSave = (field: string) => {
        if (tempValue) {
            setSettings((prev) => ({
                ...prev,
                [field]: isNaN(Number(tempValue)) ? tempValue : Number(tempValue),
            }))
        }
        setEditingField(null)
    }

    const toggleSwitch = (field: string) => {
        setSettings((prev) => ({
            ...prev,
            [field]: !prev[field as keyof typeof settings],
        }))
    }

    return (
        <div className="p-4 space-y-4 pb-24">
            {/* Header with back button */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-xl font-bold text-foreground mb-1">SETTINGS</h2>
                    <p className="text-xs text-muted-foreground font-mono">Configure drone parameters</p>
                </div>
                <Button onClick={onBack} variant="outline" size="sm" className="text-xs font-mono bg-transparent">
                    BACK
                </Button>
            </div>

            {/* Connection settings */}
            <Card className="p-3 bg-card/80 backdrop-blur border-border clip-corner">
                <p className="text-xs font-mono text-muted-foreground mb-3">CONNECTION</p>
                <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-border">
                        <div>
                            <p className="text-sm font-mono text-foreground">WiFi SSID</p>
                            <p className="text-[10px] text-muted-foreground">Currently connected</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-xs font-mono bg-transparent"
                            onClick={() => handleEdit("wifiSSID", settings.wifiSSID)}
                        >
                            {settings.wifiSSID}
                        </Button>
                    </div>

                    {editingField === "wifiSSID" && (
                        <div className="flex gap-2 py-2">
                            <Input
                                value={tempValue}
                                onChange={(e) => setTempValue(e.target.value)}
                                className="text-xs"
                                placeholder="Enter WiFi SSID"
                            />
                            <Button size="sm" className="text-xs font-mono bg-primary" onClick={() => handleSave("wifiSSID")}>
                                SAVE
                            </Button>
                        </div>
                    )}

                    <div className="flex items-center justify-between py-2 border-b border-border">
                        <div>
                            <p className="text-sm font-mono text-foreground">Channel</p>
                            <p className="text-[10px] text-muted-foreground">{settings.wifiChannel}</p>
                        </div>
                        <Button variant="outline" size="sm" className="text-xs font-mono bg-transparent" onClick={() => {
                            toast.loading("Scanning for networks...", { duration: 2000 });
                            setTimeout(() => toast.success("Scan complete. 12 networks found."), 2000);
                        }}>
                            SCAN
                        </Button>
                    </div>

                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="text-sm font-mono text-foreground">Auto Reconnect</p>
                            <p className="text-[10px] text-muted-foreground">On signal loss</p>
                        </div>
                        <Switch checked={settings.autoReconnect} onCheckedChange={() => toggleSwitch("autoReconnect")} />
                    </div>
                </div>
            </Card>

            {/* Flight settings */}
            <Card className="p-3 bg-card/80 backdrop-blur border-border clip-corner">
                <p className="text-xs font-mono text-muted-foreground mb-3">FLIGHT</p>
                <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-border">
                        <div>
                            <p className="text-sm font-mono text-foreground">Max Altitude</p>
                            <p className="text-[10px] text-muted-foreground">Safety limit</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-xs font-mono bg-transparent"
                            onClick={() => handleEdit("maxAltitude", String(settings.maxAltitude))}
                        >
                            {settings.maxAltitude}m
                        </Button>
                    </div>

                    {editingField === "maxAltitude" && (
                        <div className="flex gap-2 py-2">
                            <Input
                                type="number"
                                value={tempValue}
                                onChange={(e) => setTempValue(e.target.value)}
                                className="text-xs"
                                placeholder="Enter altitude"
                            />
                            <Button size="sm" className="text-xs font-mono bg-primary" onClick={() => handleSave("maxAltitude")}>
                                SAVE
                            </Button>
                        </div>
                    )}

                    <div className="flex items-center justify-between py-2 border-b border-border">
                        <div>
                            <p className="text-sm font-mono text-foreground">Max Distance</p>
                            <p className="text-[10px] text-muted-foreground">RTH trigger</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-xs font-mono bg-transparent"
                            onClick={() => handleEdit("maxDistance", String(settings.maxDistance))}
                        >
                            {settings.maxDistance}m
                        </Button>
                    </div>

                    {editingField === "maxDistance" && (
                        <div className="flex gap-2 py-2">
                            <Input
                                type="number"
                                value={tempValue}
                                onChange={(e) => setTempValue(e.target.value)}
                                className="text-xs"
                                placeholder="Enter distance"
                            />
                            <Button size="sm" className="text-xs font-mono bg-primary" onClick={() => handleSave("maxDistance")}>
                                SAVE
                            </Button>
                        </div>
                    )}

                    <div className="flex items-center justify-between py-2 border-b border-border">
                        <div>
                            <p className="text-sm font-mono text-foreground">Return to Home</p>
                            <p className="text-[10px] text-muted-foreground">On signal loss</p>
                        </div>
                        <Switch checked={settings.returnToHome} onCheckedChange={() => toggleSwitch("returnToHome")} />
                    </div>

                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="text-sm font-mono text-foreground">Beginner Mode</p>
                            <p className="text-[10px] text-muted-foreground">Limited speed</p>
                        </div>
                        <Switch checked={settings.beginnerMode} onCheckedChange={() => toggleSwitch("beginnerMode")} />
                    </div>
                </div>
            </Card>

            {/* Controller settings */}
            <Card className="p-3 bg-card/80 backdrop-blur border-border clip-corner">
                <p className="text-xs font-mono text-muted-foreground mb-3">CONTROLLER</p>
                <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-border">
                        <div>
                            <p className="text-sm font-mono text-foreground">Control Mode</p>
                            <p className="text-[10px] text-muted-foreground">{settings.controlMode}</p>
                        </div>
                        <Button variant="outline" size="sm" className="text-xs font-mono bg-transparent" onClick={() => toast.info("Control Mode 1 and 2 are currently supported.")}>
                            CHANGE
                        </Button>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-border">
                        <div>
                            <p className="text-sm font-mono text-foreground">Haptic Feedback</p>
                            <p className="text-[10px] text-muted-foreground">Vibration</p>
                        </div>
                        <Switch checked={settings.hapticFeedback} onCheckedChange={() => toggleSwitch("hapticFeedback")} />
                    </div>

                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="text-sm font-mono text-foreground">Audio Alerts</p>
                            <p className="text-[10px] text-muted-foreground">Voice warnings</p>
                        </div>
                        <Switch checked={settings.audioAlerts} onCheckedChange={() => toggleSwitch("audioAlerts")} />
                    </div>
                </div>
            </Card>

            {/* System info */}
            <Card className="p-3 bg-card/80 backdrop-blur border-border clip-corner">
                <p className="text-xs font-mono text-muted-foreground mb-3">SYSTEM</p>
                <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 border-b border-border">
                        <p className="text-xs font-mono text-muted-foreground">Firmware</p>
                        <p className="text-xs font-mono text-foreground">v4.5.2</p>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border">
                        <p className="text-xs font-mono text-muted-foreground">Controller</p>
                        <p className="text-xs font-mono text-foreground">v2.1.0</p>
                    </div>
                    <div className="flex items-center justify-between py-2">
                        <p className="text-xs font-mono text-muted-foreground">Flight Time</p>
                        <p className="text-xs font-mono text-foreground">24h 36m</p>
                    </div>
                </div>
            </Card>

            {/* Action buttons */}
            <div className="space-y-2">
                <Button variant="outline" className="w-full h-12 font-mono clip-corner bg-transparent" onClick={() => {
                    toast.promise(new Promise(r => setTimeout(r, 3000)), {
                        loading: "Calibrating IMU... Keep drone level.",
                        success: "Sensor calibration successful.",
                        error: "Calibration failed. Check hardware.",
                    });
                }}>
                    CALIBRATE SENSORS
                </Button>
                <Button variant="outline" className="w-full h-12 font-mono clip-corner bg-transparent" onClick={() => {
                    toast.info("Checking for firmware updates...");
                    setTimeout(() => toast.success("Firmware is up to date (v4.5.2)"), 1500);
                }}>
                    UPDATE FIRMWARE
                </Button>
                <Button
                    variant="outline"
                    className="w-full h-12 font-mono border-destructive text-destructive hover:bg-destructive/10 clip-corner bg-transparent"
                    onClick={() => {
                        if (confirm("Are you sure you want to revert to factory settings? All mission data will be lost.")) {
                            toast.error("SYSTEM RESET INITIATED", { description: "Please wait..." });
                            setTimeout(() => window.location.reload(), 2000);
                        }
                    }}
                >
                    FACTORY RESET
                </Button>
            </div>
        </div>
    )
}
