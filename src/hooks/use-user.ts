"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"

interface User {
  id: string
  name: string
  email: string,
  profilePicUrl?: string
}

export function useUser() {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await api.get<User>("/auth/me")
                setUser(userData)
            } catch (err) {
                setError(err instanceof Error ? err.message : "Erro ao carregar usuário")
                setUser(null)
            } finally {
                setIsLoading(false)
            }
        }

        fetchUser()
    }, [])

    return { user, isLoading, error }
}
