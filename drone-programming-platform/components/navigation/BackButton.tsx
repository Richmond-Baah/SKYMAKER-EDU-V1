"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface BackButtonProps {
    className?: string
    label?: string
}

export function BackButton({ className, label = "BACK" }: BackButtonProps) {
    const router = useRouter()

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className={`group text-muted-foreground hover:text-foreground transition-all flex items-center gap-2 px-2 hover:bg-white/5 rounded-lg ${className}`}
        >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        </Button>
    )
}
