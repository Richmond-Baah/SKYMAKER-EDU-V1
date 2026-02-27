"use client"

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight, Code, Cpu, Rocket, Shield, Zap, Star, Award, TrendingUp, User, ChevronDown } from 'lucide-react'
import { HeroSection } from '@/components/hero/HeroSection'
import { AuthButton } from '@/components/AuthButton'

export function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 overflow-x-hidden relative">
            {/* ─── Animated Grid Background ──────────────────────── */}
            <div className="fixed inset-0 z-0 bg-grid-pattern opacity-30 select-none pointer-events-none" />
            <div className="fixed inset-0 z-0 bg-radial-glow select-none pointer-events-none" />

            {/* ─── Premium Navigation ────────────────────────────── */}
            <header className="fixed top-0 left-0 right-0 h-20 flex items-center px-6 z-50 backdrop-blur-md border-b border-white/5 bg-black/40">
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
            <main aria-label="Main content" className="relative z-10">
                <HeroSection />

                {/* ─── Features Grid ─────────────────────────────────── */}
                <section className="py-32 relative">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-20 space-y-4">
                            <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Everything You Need to Get Off the Ground</h2>
                            <p className="text-gray-400 max-w-2xl mx-auto font-medium text-lg">We&apos;ve done all the hard work behind the scenes so you don&apos;t have to. Just open the box, plug in, and your first mission is waiting. No experience needed — just bring your excitement.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <FeatureCard
                                icon={<Code className="w-8 h-8 text-blue-400" />}
                                title="Your Code, Your Rules"
                                desc="Tell your drone to spin, climb, hover, or zoom — all with your own Python code. You're the pilot and the programmer."
                            />
                            <FeatureCard
                                icon={<Zap className="w-8 h-8 text-yellow-400" />}
                                title="From Screen to Sky in Seconds"
                                desc="Press run and watch your drone bring your code to life right in front of you. Every mission is a little \u201cwow\u201d moment waiting to happen."
                            />
                            <FeatureCard
                                icon={<Shield className="w-8 h-8 text-emerald-400" />}
                                title="Practice Safe, Then Go for It"
                                desc="Not ready to fly for real yet? No worries. Test your code in our flight simulator first, then launch your drone knowing you're completely ready."
                            />
                        </div>
                    </div>
                </section>

                {/* ─── Gamification Section ─────────────────────── */}
                <section className="py-32 relative overflow-hidden bg-black/40 border-y border-white/5">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-purple-600/10 blur-[200px] rounded-full pointer-events-none animate-pulse-slow" />

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="flex flex-col lg:flex-row gap-16 items-center">
                            <div className="lg:w-1/2 space-y-8">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                    <Award className="w-3 h-3" />
                                    Professional Growth
                                </div>
                                <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
                                    THE MORE YOU FLY, <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">THE MORE YOU GROW 🚀</span>
                                </h2>
                                <p className="text-xl text-gray-400 font-medium leading-relaxed">
                                    Every mission you complete and every line of code you write makes you better. Earn cool badges, level up your pilot profile, and track your skills as you go from total beginner to confident drone builder &mdash; one fun challenge at a time.
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                                    <div className="space-y-2 p-6 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-sm shadow-sm group hover:border-purple-500/30 transition-colors">
                                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <TrendingUp className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <h4 className="text-lg font-black">Skill Radar Tracking</h4>
                                        <p className="text-sm text-gray-500 font-medium">See exactly how you&apos;re growing across 8 key pilot skills. The better you get, the more your radar lights up.</p>
                                    </div>
                                    <div className="space-y-2 p-6 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-sm shadow-sm group hover:border-purple-500/30 transition-colors">
                                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <Award className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <h4 className="text-lg font-black">Badge Rewards</h4>
                                        <p className="text-sm text-gray-500 font-medium">Unlock 20+ badges as you complete missions and nail new tricks. Show them off and let your progress do the talking.</p>
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

                {/* ─── FAQ Section ────────────────────────────────────────── */}
                <section className="py-32 relative border-t border-white/5">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-20 space-y-4">
                            <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Frequently Asked Questions</h2>
                            <p className="text-gray-400 max-w-2xl mx-auto font-medium text-lg">Got questions? We&apos;ve got answers.</p>
                        </div>
                        <div className="max-w-3xl mx-auto space-y-4">
                            <FaqItem
                                question="Do I need any coding experience to get started?"
                                answer="Not at all! SkyMaker is built for complete beginners. We walk you through everything step by step, so even if you've never written a single line of code before, you'll be flying in no time."
                            />
                            <FaqItem
                                question="What age is SkyMaker for?"
                                answer="If you're curious and love making things, you're the right age. SkyMaker works great for kids from around 10 years old all the way up to adults who just want to have fun building and flying drones."
                            />
                            <FaqItem
                                question="What's included when I sign up?"
                                answer="You get full access to our mission library, the flight simulator, and your personal pilot profile right away. If you order the SkyMaker Core S3 kit, everything you need to build and fly your drone is included in the box."
                            />
                            <FaqItem
                                question="Do I need to buy the drone kit to use SkyMaker?"
                                answer="Nope! You can explore the platform, try the simulator, and start learning Python completely free. When you're ready to fly for real, that's when you grab the kit."
                            />
                            <FaqItem
                                question="Is it safe?"
                                answer="Absolutely. Our simulator lets you practice as much as you want before you ever touch the real drone. And the SkyMaker Core S3 is designed with beginners in mind — safe, sturdy, and built to handle a few bumpy landings."
                            />
                            <FaqItem
                                question="What if I get stuck?"
                                answer="No one flies alone here. Our community on Discord is full of fellow builders who are happy to help, and our mission guides are designed to make sure you always know what to do next."
                            />
                        </div>
                    </div>
                </section>

                {/* ─── CTA ───────────────────────────────────────────────── */}
                <section className="py-32 bg-gradient-to-b from-transparent to-blue-900/10 border-t border-white/5">
                    <div className="container mx-auto px-4 text-center">
                        <div className="max-w-4xl mx-auto space-y-12">
                            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">Your Drone is Waiting. Are You Ready? ✈️</h2>
                            <p className="text-xl text-gray-400 font-medium">Thousands of young builders and hobbyists have already taken their first flight. Now it&apos;s your turn &mdash; and it won&apos;t cost you a thing to start.</p>
                            <Link href="/learn">
                                <Button size="lg" className="h-20 px-12 rounded-3xl text-2xl font-black bg-white text-black hover:bg-gray-100 shadow-2xl hover:scale-105 transition-all focus:ring-4 focus:ring-blue-500/50">
                                    Start Flying Free Today
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
            className="relative p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/5 backdrop-blur-3xl hover:bg-white/[0.06] hover:border-blue-500/40 transition-all duration-500 group focus-within:ring-4 focus-within:ring-blue-500/30 outline-none hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.15)] overflow-hidden"
            tabIndex={0}
        >
            {/* Hover Glow Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative z-10">
                <div className="mb-6 w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500/10 transition-all duration-500 shadow-inner border border-white/5 group-hover:border-blue-500/20 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                    {icon}
                </div>
                <h3 className="text-2xl font-black mb-3 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-blue-200 transition-colors">{title}</h3>
                <p className="text-gray-400 group-hover:text-gray-300 font-medium leading-relaxed transition-colors">{desc}</p>
            </div>
        </div>
    )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
    const [isOpen, setIsOpen] = React.useState(false)
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm overflow-hidden transition-colors hover:border-blue-500/20">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 text-left gap-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-2xl"
            >
                <span className="text-lg font-bold">{question}</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="px-6 pb-6 text-gray-400 font-medium leading-relaxed">{answer}</p>
            </div>
        </div>
    )
}
