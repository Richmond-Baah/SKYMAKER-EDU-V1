'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import { Rocket, Mail, Lock, User, UserPlus, ArrowLeft, ShieldCheck, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export default function SignUpPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isSuccess, setIsSuccess] = useState(false)

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            })

            if (error) throw error

            if (data.user) {
                setIsSuccess(true)
                toast.success('Registration Initiated. Check your secure comms (email).')
            }
        } catch (error: any) {
            setError(error.message)
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white px-4 relative overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px]" />
                <div className="max-w-md w-full relative z-10 text-center space-y-8">
                    <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/50 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-4xl font-black tracking-tighter">MISSION INITIATED</h2>
                        <p className="text-gray-400 font-medium leading-relaxed">
                            A verification link has been sent to <span className="text-emerald-400 font-bold">{email}</span>.
                            Please confirm your clearance to join the squadron.
                        </p>
                    </div>
                    <Button
                        asChild
                        className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition-all"
                    >
                        <Link href="/auth/login">GO TO LOGIN BASE</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white px-4 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-400/10 rounded-full blur-[120px]" />

            <div className="max-w-md w-full relative z-10">
                {/* Back to Home */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-white transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Back to SkyMaker Home
                </Link>

                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-6 font-black text-2xl">
                            <UserPlus className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-black tracking-tighter text-center uppercase">
                            New Pilot <span className="text-blue-500">Registry</span>
                        </h2>
                        <p className="mt-2 text-center text-gray-400 font-medium leading-tight">
                            Create your credentials to join the elite squadron.
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSignUp}>
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 animate-shake">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="fullName" className="block text-xs font-black text-gray-500 uppercase tracking-widest ml-1">
                                    Callsign (Full Name)
                                </label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        id="fullName"
                                        type="text"
                                        required
                                        placeholder="Pilot Maverick"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full bg-white/[0.05] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm font-bold placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-xs font-black text-gray-500 uppercase tracking-widest ml-1">
                                    Official Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        placeholder="pilot@skymaker.edu"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-white/[0.05] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm font-bold placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="password" className="block text-xs font-black text-gray-500 uppercase tracking-widest ml-1">
                                    Secure Access Code
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        placeholder="Min 6 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white/[0.05] border border-white/10 rounded-xl py-3 pl-12 pr-12 text-sm font-bold placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono tracking-widest"
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                        title={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ENROLLING...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Rocket className="w-4 h-4" />
                                    CREATE PILOT PROFILE
                                </div>
                            )}
                        </Button>

                        <div className="pt-4 flex flex-col items-center gap-4">
                            <p className="text-sm text-gray-500 font-bold">
                                Already a pilot?{' '}
                                <Link href="/auth/login" className="text-blue-500 hover:text-blue-400 transition-colors">
                                    Return to Base
                                </Link>
                            </p>

                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">
                                <ShieldCheck className="w-3 h-3" />
                                Identity Protection Active
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
