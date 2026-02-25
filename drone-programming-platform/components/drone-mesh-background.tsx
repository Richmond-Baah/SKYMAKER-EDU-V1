"use client"

export function DroneMeshBackground() {
    return (
        <div
            className="absolute inset-0 overflow-hidden bg-cover bg-center"
            style={{
                backgroundImage: "url(/drone-bg.jpg)",
                backgroundAttachment: "fixed",
            }}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70" />

            {/* SVG mesh and grid overlay for tech aesthetic */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                <defs>
                    {/* Hexagonal mesh pattern */}
                    <pattern id="hexGrid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                        <path
                            d="M30,0 L60,17.32 L60,51.96 L30,69.28 L0,51.96 L0,17.32 Z"
                            fill="none"
                            stroke="rgba(118, 185, 0, 0.15)"
                            strokeWidth="1.5"
                        />
                    </pattern>

                    {/* Navigation grid lines - vertical */}
                    <pattern id="navGridV" x="0" y="0" width="80" height="1" patternUnits="userSpaceOnUse">
                        <line x1="0" y1="0" x2="80" y2="0" stroke="rgba(30, 144, 255, 0.08)" strokeWidth="1" />
                    </pattern>

                    {/* Navigation grid lines - horizontal */}
                    <pattern id="navGridH" x="0" y="0" width="1" height="80" patternUnits="userSpaceOnUse">
                        <line x1="0" y1="0" x2="0" y2="80" stroke="rgba(30, 144, 255, 0.08)" strokeWidth="1" />
                    </pattern>

                    {/* Radial glow effect */}
                    <radialGradient id="glowCenter" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="rgba(118, 185, 0, 0.08)" />
                        <stop offset="100%" stopColor="rgba(118, 185, 0, 0)" />
                    </radialGradient>
                </defs>

                {/* Hexagonal mesh */}
                <rect width="100%" height="100%" fill="url(#hexGrid)" />

                {/* Vertical navigation grid */}
                <rect width="100%" height="100%" fill="url(#navGridV)" />

                {/* Horizontal navigation grid */}
                <rect width="100%" height="100%" fill="url(#navGridH)" />

                {/* Center glow */}
                <circle cx="50%" cy="50%" r="40%" fill="url(#glowCenter)" />
            </svg>

            {/* Tech accent lighting */}
            <div className="absolute top-0 left-1/4 w-1 h-1/3 bg-gradient-to-b from-blue-500/20 to-transparent blur-xl" />
            <div className="absolute bottom-0 right-1/4 w-1 h-1/3 bg-gradient-to-t from-green-500/15 to-transparent blur-xl" />
        </div>
    )
}
