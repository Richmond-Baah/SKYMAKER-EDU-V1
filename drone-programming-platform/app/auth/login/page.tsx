'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import { Rocket, Mail, Lock, LogIn, ArrowLeft, ShieldCheck, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            if (data.user) {
                toast.success('Access Granted. Welcome back, Pilot.')
                router.push('/learn')
                router.refresh()
            }
        } catch (error: any) {
            setError(error.message)
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
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
                        <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-6">
                            <Rocket className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-black tracking-tighter text-center">
                            PILOT <span className="text-blue-500">SIGN-IN</span>
                        </h2>
                        <p className="mt-2 text-center text-gray-400 font-medium">
                            Enter your credentials to access the base.
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleLogin}>
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 animate-shake">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-xs font-black text-gray-500 uppercase tracking-widest ml-1">
                                    Flight ID (Email)
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
                                    Access Code
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white/[0.05] border border-white/10 rounded-xl py-3 pl-12 pr-12 text-sm font-bold placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono tracking-widest"
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
                                    AUTHENTICATING...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <LogIn className="w-4 h-4" />
                                    INITIATE LOGIN
                                </div>
                            )}
                        </Button>

                        <div className="pt-4 flex flex-col items-center gap-4">
                            <p className="text-sm text-gray-500 font-bold">
                                New pilot?{' '}
                                <Link href="/auth/signup" className="text-blue-500 hover:text-blue-400 transition-colors">
                                    Join the Squadron
                                </Link>
                            </p>

                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">
                                <ShieldCheck className="w-3 h-3" />
                                Secure Encryption Enabled
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
