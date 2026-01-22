"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"
import { api } from "@/lib/api"

interface AuthContextType {
    isAuthenticated: boolean
    isLoading: boolean
    login: () => void
    logout: () => Promise<void>
    refreshToken: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_REFRESH_INTERVAL = 14 * 60 * 1000

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const refreshToken = useCallback(async () => {
        try {
            await api.post("/auth/refresh", {}, { requiresAuth: false })
            setIsAuthenticated(true)
        } catch (error) {
            console.error("Token refresh failed:", error)
            setIsAuthenticated(false)
        }
    }, [])

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await api.get("/auth/me", { requiresAuth: false })
                setIsAuthenticated(true)
            } catch (error) {
                setIsAuthenticated(false)
            } finally {
                setIsLoading(false)
            }
        }

        checkAuth()
    }, [])

    useEffect(() => {
        if (!isAuthenticated) return

        const intervalId = setInterval(() => {
            refreshToken()
        }, TOKEN_REFRESH_INTERVAL)

        return () => clearInterval(intervalId)
    }, [isAuthenticated, refreshToken])

    const login = () => {
        setIsAuthenticated(true)
    }

    const logout = async () => {
        try {
            await api.post("/auth/logout", {}, { requiresAuth: false })
        } catch (error) {
            console.error("Logout error:", error)
        } finally {
            setIsAuthenticated(false)
        }
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, refreshToken }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
