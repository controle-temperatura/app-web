"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { api } from "@/lib/api"

export function useLogin() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const { login } = useAuth()

    const handleLogin = async (email: string, password: string) => {
        setIsLoading(true)
        setError(null)

        try {
            await api.post(
                "/auth/login",
                { email, password },
                { requiresAuth: false }
            )

            login()
            
            router.push("/dashboard")
        } catch (err) {
            setError(err instanceof Error ? err.message : "Credenciais inválidas")
        } finally {
            setIsLoading(false)
        }
    }

    return {
        handleLogin,
        isLoading,
        error,
    }
}
