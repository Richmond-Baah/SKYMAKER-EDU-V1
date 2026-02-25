"use client"

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight, Code, Cpu, Rocket, Shield, Zap, Star, Award, TrendingUp, User } from 'lucide-react'
import { HeroSection } from '@/components/hero/HeroSection'
import { AuthButton } from '@/components/AuthButton'

export function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 overflow-x-hidden">
            {/* ─── Premium Navigation ────────────────────────────── */}
            <header className="fixed top-0 left-0 right-0 h-20 flex items-center px-6 z-50 backdrop-blur-md border-b border-white/5 bg-black/20">
                <nav aria-label="Main navigation" className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Rocket className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-black tracking-tighter">SKYMAKER <span className="text-blue-500">EDU</span></span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/learn" className="text-sm font-bold text-gray-400 hover:text-white transition-colors focus:ring-2 focus:ring-blue-500/50 rounded-lg p-1">Platform</Link>
                        <Link href="/missions" className="text-sm font-bold text-gray-400 hover:text-white transition-colors focus:ring-2 focus:ring-blue-500/50 rounded-lg p-1">Missions</Link>
                        <Link href="/profile" className="text-sm font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-2 focus:ring-2 focus:ring-blue-500/50 rounded-lg p-1">
                            Profile
                        </Link>
                        <Link href="/dashboard" className="text-sm font-bold text-gray-400 hover:text-white transition-colors focus:ring-2 focus:ring-blue-500/50 rounded-lg p-1">Dashboard</Link>
                        <div className="pl-3 border-l border-border py-1">
                            <AuthButton />
                        </div>
                    </div>
                </nav>
            </header>

            {/* ─── Hero Section ─────────────────────────────────── */}
            <main aria-label="Main content">
                <HeroSection />

                {/* ─── Features Grid ─────────────────────────────────── */}
                <section className="py-32 relative">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-20 space-y-4">
                            <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Engineered for Success</h2>
                            <p className="text-gray-400 max-w-2xl mx-auto font-medium text-lg">We provide the tools, you provide the curiosity. Everything is designed to be plug-and-play-and-code.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <FeatureCard
                                icon={<Code className="w-8 h-8 text-blue-400" />}
                                title="Python Integration"
                                desc="Write professional Python scripts to control your drone with real-time flight telemetry."
                            />
                            <FeatureCard
                                icon={<Zap className="w-8 h-8 text-yellow-400" />}
                                title="Instant Sync"
                                desc="Write code and see it run on the hardware instantly via Wi-Fi telemetry and control."
                            />
                            <FeatureCard
                                icon={<Shield className="w-8 h-8 text-emerald-400" />}
                                title="Sim-to-Real"
                                desc="A physics-based simulator ensures your code works before you ever risk a crash."
                            />
                        </div>
                    </div>
                </section>

                {/* ─── Gamification Section ─────────────────────── */}
                <section className="py-32 relative overflow-hidden bg-black/50">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-600/5 blur-[200px] rounded-full pointer-events-none" />

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="flex flex-col lg:flex-row gap-16 items-center">
                            <div className="lg:w-1/2 space-y-8">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                    <Award className="w-3 h-3" />
                                    Professional Growth
                                </div>
                                <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
                                    GAMIFIED <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">TO THE CORE</span>
                                </h2>
                                <p className="text-xl text-gray-400 font-medium leading-relaxed">
                                    Don&apos;t just learn—evolve. Our gamified profile system tracks every line of code and every successful flight, turning your learning journey into an achievement-packed career path.
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                                    <div className="space-y-2 p-6 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-sm shadow-sm group hover:border-purple-500/30 transition-colors">
                                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <TrendingUp className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <h4 className="text-lg font-black">Skill Radar Tracking</h4>
                                        <p className="text-sm text-gray-500 font-medium">Visualize your growth across 8 core drone pilot skills, from stability to creative logic.</p>
                                    </div>
                                    <div className="space-y-2 p-6 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-sm shadow-sm group hover:border-purple-500/30 transition-colors">
                                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <Award className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <h4 className="text-lg font-black">Badge Rewards</h4>
                                        <p className="text-sm text-gray-500 font-medium">Unlock 20+ specialized badges as you master precision flight and complex autonomous missions.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:w-1/2 relative">
                                <div className="relative rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl bg-[#0a0a0a]">
                                    <div className="p-8 space-y-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 p-0.5">
                                                <div className="w-full h-full bg-[#0a0a0a] rounded-[14px] flex items-center justify-center">
                                                    <User className="w-10 h-10 text-white/50" />
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black tracking-tight">SkyWalker Pilot</h3>
                                                <p className="text-purple-400 text-sm font-black uppercase tracking-widest">Advanced Drone Architect</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                                <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Flight Streak</p>
                                                <p className="text-2xl font-black text-white">12 Days 🔥</p>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                                <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Missions</p>
                                                <p className="text-2xl font-black text-white">45 / 60 🎯</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center text-sm font-bold">
                                                <span className="text-gray-400">Mastery Progress</span>
                                                <span className="text-purple-400">75%</span>
                                            </div>
                                            <div className="h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                                                <div className="h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full" style={{ width: '75%' }} />
                                            </div>
                                        </div>

                                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xl">🎯</div>
                                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xl">🏆</div>
                                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xl">🔥</div>
                                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xl">🧠</div>
                                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-xl grayscale opacity-30">🔒</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── CTA ───────────────────────────────────────────── */}
                <section className="py-32 bg-gradient-to-b from-transparent to-blue-900/10 border-t border-white/5">
                    <div className="container mx-auto px-4 text-center">
                        <div className="max-w-4xl mx-auto space-y-12">
                            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">Ready to Build Your First Drone?</h2>
                            <p className="text-xl text-gray-400 font-medium">Join thousands of students and engineers mastering robotics today.</p>
                            <Link href="/learn">
                                <Button size="lg" className="h-20 px-12 rounded-3xl text-2xl font-black bg-white text-black hover:bg-gray-100 shadow-2xl hover:scale-105 transition-all focus:ring-4 focus:ring-blue-500/50">
                                    Launch Platform Free
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* ─── Footer ────────────────────────────────────────── */}
            <footer className="py-12 border-t border-white/5 bg-black/40">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <span className="font-black text-xl tracking-tighter uppercase opacity-50">VhimLabs</span>
                    </div>
                    <div className="flex gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">
                        <a href="#" className="hover:text-white transition-colors focus:ring-2 focus:ring-blue-500/50 rounded p-1">Discord</a>
                        <a href="#" className="hover:text-white transition-colors focus:ring-2 focus:ring-blue-500/50 rounded p-1">GitHub</a>
                        <a href="#" className="hover:text-white transition-colors focus:ring-2 focus:ring-blue-500/50 rounded p-1">Contact</a>
                    </div>
                    <p className="text-[10px] text-gray-700 font-bold uppercase tracking-widest">© 2026 VhimLabs</p>
                </div>
            </footer>
        </div>
    )
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div
            className="p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-2xl hover:bg-white/[0.06] hover:border-blue-500/30 transition-all duration-500 group focus-within:ring-4 focus-within:ring-blue-500/30 outline-none"
            tabIndex={0}
        >
            <div className="mb-6 w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500/10 transition-all duration-500">
                {icon}
            </div>
            <h3 className="text-2xl font-black mb-3 tracking-tight">{title}</h3>
            <p className="text-gray-500 font-medium leading-relaxed">{desc}</p>
        </div>
    )
}
