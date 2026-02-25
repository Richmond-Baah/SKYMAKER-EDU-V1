interface TelemetryData {
    speed: number;
    height: number;
}

export function StatusBar({ data }: { data: TelemetryData }) {
    return (
        <div className="border-b border-white/5 bg-black/40 backdrop-blur-md w-full">
            <div className="px-4 py-2 flex flex-row items-center justify-center gap-6 text-[10px] sm:text-xs font-mono">
                {/* Battery Indicator */}
                <div className="flex items-center gap-0.5">
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-[1px] bg-primary border border-primary" />
                    <span className="text-muted-foreground drop-shadow-lg" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
                        BATTERY
                    </span>
                </div>

                {/* WiFi Status */}
                <div className="flex items-center gap-0.5">
                    <svg
                        className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-muted-foreground drop-shadow-lg"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                        />
                    </svg>
                    <span className="text-muted-foreground drop-shadow-lg" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
                        WI-FI
                    </span>
                </div>

                {/* Bluetooth Status */}
                <div className="flex items-center gap-0.5">
                    <svg
                        className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-muted-foreground drop-shadow-lg"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M17.71 11.71L12 6h-.01L6.29 11.71C6.11 11.9 6 12.15 6 12.4c0 .25.11.5.29.71L12 18.83l5.71-5.71c.18-.21.29-.46.29-.71zM12 5.04L6.41 10.63 12 16.22l5.59-5.59L12 5.04z" />
                    </svg>
                    <span className="text-muted-foreground drop-shadow-lg" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
                        BLUETOOTH
                    </span>
                </div>

                <div className="w-px h-2.5 sm:h-3 bg-border hidden sm:block" />

                {/* Speed and Height */}
                <div className="flex items-center gap-1 sm:gap-2">
                    <div className="flex items-center gap-0.5">
                        <span className="text-primary font-mono drop-shadow-lg" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
                            HS
                        </span>
                        <span className="text-foreground drop-shadow-lg" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
                            {data.speed.toFixed(1)}m/s
                        </span>
                    </div>
                    <div className="flex items-center gap-0.5">
                        <span className="text-primary font-mono drop-shadow-lg" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
                            H
                        </span>
                        <span className="text-foreground drop-shadow-lg" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
                            {data.height.toFixed(1)}m
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
