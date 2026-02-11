"use client"

import { Sidebar } from "@/components/layout/sidebar/sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Header from "@/components/layout/header/header"

export default function PrivateLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const { isAuthenticated, isLoading } = useAuth()

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
        router.push("/login")
        }
    }, [isAuthenticated, isLoading, router])

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-lg">Carregando...</div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <Sidebar />
                <SidebarInset className="flex-1">
                    <Header />
                    <main className="flex-1 p-4 sm:p-6">
                        {children}
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    )
}
