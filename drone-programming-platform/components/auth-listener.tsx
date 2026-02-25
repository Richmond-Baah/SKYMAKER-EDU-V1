'use client'

import { useAuth } from '@/hooks/use-auth'

export function AuthListener() {
    useAuth()
    return null
}
