'use client'

import React from 'react'
import Link from 'next/link'
import { Rocket, LogIn, Home, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SignOutPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white px-4 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-400/10 rounded-full blur-[120px]" />

            <div className="max-w-md w-full relative z-10 text-center space-y-10">
                <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-white/[0.03] border border-white/10 rounded-3xl flex items-center justify-center shadow-2xl backdrop-blur-xl mb-8 group">
                        <Rocket className="w-10 h-10 text-gray-400 group-hover:text-blue-400 transition-colors duration-500 rotate-180" />
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-4xl font-black tracking-tighter uppercase italic flex items-center justify-center gap-3">
                            Mission <span className="text-gray-500">Suspended</span>
                        </h2>
                        <div className="h-1 w-24 bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto rounded-full" />
                        <p className="text-gray-400 font-medium leading-relaxed max-w-[280px] mx-auto">
                            You have successfully exited the flight deck. All systems are currently in standby.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <Button
                        asChild
                        className="h-14 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center gap-3 text-lg"
                    >
                        <Link href="/auth/login">
                            <LogIn className="w-5 h-5" />
                            RESUME MISSION
                        </Link>
                    </Button>

                    <Button
                        asChild
                        variant="ghost"
                        className="h-14 border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white font-black rounded-2xl transition-all flex items-center gap-3 text-lg"
                    >
                        <Link href="/">
                            <Home className="w-5 h-5" />
                            RETURN TO BASE
                        </Link>
                    </Button>
                </div>

                <div className="pt-4 animate-pulse">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/10 rounded-full text-[10px] font-black text-blue-400 uppercase tracking-widest">
                        <Sparkles className="w-3 h-3" />
                        Awaiting your next flight
                    </div>
                </div>
            </div>
        </div>
    )
}
