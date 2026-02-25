"use client"

export function ActionButtons({ onNavigate }: { onNavigate: (view: "settings" | "flight-modes" | "takeoff") => void }) {
    const buttons = [
        { id: "takeoff", icon: "takeoff", label: "TAKEOFF\nAND\nLANDING" },
        { id: "flight", icon: "flight", label: "FLIGHT\nMODES" },
        { id: "settings", icon: "settings", label: "SETTINGS" },
    ]

    return (
        <div className="flex items-center justify-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 flex-wrap">
            {buttons.map((btn) => (
                <button
                    key={btn.id}
                    onClick={() => {
                        if (btn.id === "takeoff") onNavigate("takeoff")
                        else if (btn.id === "flight") onNavigate("flight-modes")
                        else if (btn.id === "settings") onNavigate("settings")
                    }}
                    className="flex flex-col items-center gap-0.5 group transition-transform hover:scale-110"
                >
                    <div className="w-8 sm:w-10 md:w-12 lg:w-14 h-8 sm:h-10 md:h-12 lg:h-14 rounded-full border-2 border-foreground/40 flex items-center justify-center group-hover:border-primary group-hover:text-primary transition-colors">
                        <svg className="w-4 sm:w-5 md:w-5.5 lg:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {btn.icon === "takeoff" && (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                                />
                            )}
                            {btn.icon === "flight" && (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            )}
                            {btn.icon === "settings" && (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                />
                            )}
                        </svg>
                    </div>
                    {/* Label */}
                    <span
                        className="text-[6px] sm:text-[7px] md:text-[8px] lg:text-[9px] font-mono font-bold leading-tight text-center whitespace-pre-line text-primary drop-shadow-lg"
                        style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
                    >
                        {btn.label}
                    </span>
                </button>
            ))}
        </div>
    )
}
