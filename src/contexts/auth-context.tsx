"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { api } from "@/lib/api"

interface AuthContextType {
    isAuthenticated: boolean
    isLoading: boolean
    login: () => void
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

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
        <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
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
