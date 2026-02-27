"use client"

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowRight, Play, Star } from 'lucide-react'
import { heroVariants, HeroVariantKey } from '@/lib/hero-variants'
import { trackHeroEvent } from '@/lib/analytics'

export function HeroSection() {
    const router = useRouter()

    // Switch variant via environment variable
    const currentVariantKey = (process.env.NEXT_PUBLIC_HERO_VARIANT as HeroVariantKey) || 'current'
    const heroText = heroVariants[currentVariantKey]

    const handleCtaClick = (action: string, path: string) => {
        trackHeroEvent(action, currentVariantKey)
        router.push(path)
    }

    return (
        <section
            aria-label="Hero section"
            className="relative min-h-screen flex flex-col justify-center items-center pt-20 px-4 overflow-hidden"
        >
            {/* Background Ambient Glows */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 blur-[180px] rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse-slow" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 blur-[180px] rounded-full translate-y-1/2 -translate-x-1/2 animate-pulse-slow" style={{ animationDelay: '2s' }} />

            <div className="container mx-auto z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">

                    {/* Text Content - Order 2 on mobile (below image) */}
                    <div className="space-y-8 text-center lg:text-left order-2 lg:order-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] animate-in fade-in slide-in-from-top-4 duration-700">
                            <Star className="w-3 h-3 fill-current" />
                            World-Class Drone Education
                        </div>

                        <h1 className="text-4xl md:text-6xl lg:text-8xl font-black tracking-tighter leading-[0.9] animate-in fade-in slide-in-from-left-8 duration-700 delay-100">
                            THE FUTURE <br />
                            OF <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 drop-shadow-[0_0_25px_rgba(56,189,248,0.3)]">FLIGHT</span>
                        </h1>

                        <p className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium animate-in fade-in slide-in-from-left-8 duration-700 delay-200">
                            {heroText}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                            <Button
                                onClick={() => handleCtaClick('get_started_clicked', '/learn')}
                                size="lg"
                                className="relative overflow-hidden w-full sm:w-auto h-16 px-8 rounded-2xl text-lg font-black bg-blue-600 hover:bg-blue-500 shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] gap-2 transition-all hover:scale-105 active:scale-95 focus:ring-4 focus:ring-blue-500/50 focus:outline-none group"
                            >
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:animate-[shimmer_1.5s_infinite]" />
                                <span className="relative z-10 flex items-center gap-2">Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
                            </Button>

                            <Button
                                onClick={() => handleCtaClick('explore_library_clicked', '/auth/signup')}
                                size="lg"
                                variant="secondary"
                                className="w-full sm:w-auto h-16 px-8 rounded-2xl text-lg font-black bg-white/5 border border-white/10 hover:bg-white/10 gap-2 backdrop-blur-md transition-all focus:ring-4 focus:ring-blue-500/50 focus:outline-none"
                            >
                                Explore Library
                            </Button>
                        </div>

                        {/* "See It In Action" Element */}
                        <div
                            className="flex items-center gap-4 cursor-pointer group justify-center lg:justify-start animate-in fade-in duration-700 delay-400"
                            onClick={() => handleCtaClick('watch_video_clicked', '#')}
                        >
                            <div className="w-16 h-16 rounded-full bg-blue-600/20 group-hover:bg-blue-600/30 flex items-center justify-center transition-all">
                                <Play className="w-8 h-8 text-blue-400 fill-current ml-1" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-black text-white uppercase tracking-tight">See it in action</p>
                                <p className="text-xs text-gray-500 font-bold">Watch a mission in 60 seconds</p>
                            </div>
                        </div>

                        {/* Stats Section */}
                        <div className="pt-6 animate-in fade-in duration-700 delay-500">
                            <div className="flex gap-8 items-center justify-center lg:justify-start">
                                <div>
                                    <p className="text-3xl font-black tabular-nums">2.4k+</p>
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Builders and Counting</p>
                                </div>
                                <div className="w-px h-8 bg-white/10" />
                                <div>
                                    <p className="text-3xl font-black tabular-nums">50+</p>
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Missions Ready to Launch</p>
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-4">
                                From bedrooms to backyards, young makers all over the world are already flying. Come join them.
                            </p>
                        </div>
                    </div>

                    {/* Image Content - Order 1 on mobile (shows first) */}
                    <div className="relative group animate-in fade-in zoom-in-95 duration-1000 delay-400 order-1 lg:order-2">
                        {/* Image Showcase with Glass Frame */}
                        <div className="relative aspect-square w-full max-w-[550px] mx-auto rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(59,130,246,0.15)] animate-float">
                            <Image
                                src="/drone.png"
                                alt="SkyMaker Core S3 educational drone kit showing exposed circuit board, four propellers, and development hardware ready for programming"
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                priority
                            />
                            {/* Gradient Overlay for Text Visibility */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                            {/* Floating Overlay Badge */}
                            <div className="absolute bottom-8 left-8 right-8 p-6 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10 animate-in slide-in-from-bottom-10 duration-1000 delay-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] uppercase font-black text-blue-400 tracking-widest mb-1">Featured Hardware</p>
                                        <h3 className="text-xl font-black tracking-tight">SkyMaker Core S3</h3>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/20">
                                        <Image src="/drone.png" width={24} height={24} alt="icon" className="opacity-50" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Decorative elements */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none" />
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/20 rounded-full blur-[80px] pointer-events-none" />
                    </div>
                </div>
            </div>
        </section>
    )
}
