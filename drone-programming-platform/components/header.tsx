export default function Header({ droneStatus }: { droneStatus: string }) {
  const statusColors: Record<string, string> = {
    ready: "bg-emerald-500",
    flying: "bg-cyan-500",
    "executing task": "bg-blue-500",
    "task stopped": "bg-yellow-500",
    landed: "bg-emerald-500",
  }

  return (
    <header className="h-20 bg-card border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${statusColors[droneStatus] || "bg-gray-500"}`} />
          <span className="text-sm font-medium text-muted-foreground capitalize">{droneStatus}</span>
        </div>
      </div>

      <h1 className="text-2xl font-bold">Drone Command Center</h1>

      <div className="text-sm text-muted-foreground">v1.0.0</div>
    </header>
  )
}
