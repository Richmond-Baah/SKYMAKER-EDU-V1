"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface TaskProgrammerProps {
  onTaskStart: (taskName: string) => void
  onTaskStop: () => void
  taskRunning: boolean
}

export default function TaskProgrammer({ onTaskStart, onTaskStop, taskRunning }: TaskProgrammerProps) {
  const [selectedTask, setSelectedTask] = useState<string | null>(null)

  const tasks = [
    {
      id: "drone-olympics",
      name: "Drone Olympics",
      description: "Multi-event drone competition with obstacles and speed trials",
      icon: "🏆",
      events: ["Slalom", "Speed Race", "Precision Landing", "Obstacle Course"],
    },
    {
      id: "light-show",
      name: "Light Show",
      description: "Synchronized aerial light display with dynamic formations",
      icon: "✨",
      events: ["Formation Dance", "Gradient Patterns", "Strobe Effects", "Finale Burst"],
    },
    {
      id: "mapping",
      name: "Area Mapping",
      description: "Autonomous grid-based survey mission with image capture",
      icon: "📍",
      events: ["Grid Planning", "Autonomous Flight", "Image Capture", "Data Processing"],
    },
    {
      id: "inspection",
      name: "Infrastructure Inspection",
      description: "Close-range inspection of structures with precision control",
      icon: "🔍",
      events: ["Route Planning", "Close Proximity Flight", "Recording", "Analysis"],
    },
    {
      id: "delivery",
      name: "Package Delivery",
      description: "Automated waypoint navigation with payload management",
      icon: "📦",
      events: ["Waypoint Setup", "Autonomous Flight", "Drop Point", "Return Home"],
    },
    {
      id: "race",
      name: "Drone Racing",
      description: "High-speed autonomous racing through predefined gates",
      icon: "🏁",
      events: ["Gate Detection", "High Speed Nav", "Split Times", "Lap Record"],
    },
  ]

  return (
    <div className="flex flex-col h-full overflow-auto p-6 gap-6">
      {/* Task Selection */}
      <div className="grid grid-cols-2 gap-4 flex-1 overflow-auto">
        {tasks.map((task) => (
          <Card
            key={task.id}
            className={`border-border cursor-pointer transition-all hover:border-cyan-500 ${
              selectedTask === task.id ? "ring-2 ring-cyan-500" : ""
            }`}
            onClick={() => setSelectedTask(task.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="text-2xl">{task.icon}</span>
                  {task.name}
                </CardTitle>
              </div>
              <CardDescription>{task.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-semibold">Phases:</p>
                <div className="flex flex-wrap gap-1">
                  {task.events.map((event) => (
                    <span key={event} className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                      {event}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Control Section */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Task Control</CardTitle>
          <CardDescription>
            {selectedTask ? `${tasks.find((t) => t.id === selectedTask)?.name} selected` : "Select a task to begin"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            disabled={!selectedTask || taskRunning}
            onClick={() => selectedTask && onTaskStart(tasks.find((t) => t.id === selectedTask)?.name || "Task")}
          >
            Start Task
          </Button>
          <Button className="flex-1 bg-red-600 hover:bg-red-700" disabled={!taskRunning} onClick={onTaskStop}>
            Stop Task
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
