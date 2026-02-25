"use client"

import React, { useRef, useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Terminal, X } from 'lucide-react'

export interface ConsoleEntry {
    type: 'output' | 'error' | 'success' | 'info' | 'warning'
    message: string
    timestamp: string
}

interface ConsoleOutputProps {
    entries: ConsoleEntry[]
    onClear: () => void
}

const TYPE_COLORS: Record<ConsoleEntry['type'], string> = {
    error: 'text-red-400',
    success: 'text-emerald-400',
    output: 'text-blue-400',
    warning: 'text-amber-400',
    info: 'text-white/40',
}

/**
 * Console output component for the mission workspace.
 * Displays execution logs, errors, and success messages.
 */
export function ConsoleOutput({ entries, onClear }: ConsoleOutputProps) {
    const scrollRef = useRef<HTMLDivElement>(null)

    // Auto-scroll to bottom on new entries
    useEffect(() => {
        if (scrollRef.current) {
            requestAnimationFrame(() => {
                scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
            })
        }
    }, [entries.length])

    return (
        <div className="h-[180px] shrink-0 border-t border-white/10 flex flex-col bg-[#050507] z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-white/[0.03] border-b border-white/5">
                <div className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.1em] text-white/60">
                        System Console
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/5 border border-emerald-500/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                        <span className="text-[9px] text-emerald-500/80 uppercase font-bold tracking-tighter">
                            Engine Live
                        </span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClear}
                        className="h-5 text-[9px] px-2 text-white/30 hover:text-white hover:bg-white/5 uppercase font-bold"
                    >
                        Clear
                    </Button>
                </div>
            </div>

            {/* Entries */}
            <ScrollArea className="flex-1 bg-black/40" ref={scrollRef}>
                <div className="p-4 font-mono text-[11px] leading-relaxed space-y-1">
                    {entries.length === 0 ? (
                        <div className="text-white/10 italic">
                            Awaiting drone protocol engagement...
                        </div>
                    ) : (
                        entries.map((entry, idx) => (
                            <div
                                key={idx}
                                className={`flex gap-3 group animate-in fade-in slide-in-from-left-1 duration-200 ${TYPE_COLORS[entry.type]}`}
                            >
                                <span className="text-white/10 shrink-0 select-none">
                                    [{entry.timestamp}]
                                </span>
                                <span className="flex-1 break-all font-medium">{entry.message}</span>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
