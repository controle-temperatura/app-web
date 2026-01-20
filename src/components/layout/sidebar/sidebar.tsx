"use client"

import { Sidebar as SidebarPrimitive, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar"
import Image from "next/image"
import SidebarItem from "./sidebar-item"
import { HomeIcon, ThermometerIcon, SettingsIcon, LogOutIcon } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export function Sidebar() {
    const { logout } = useAuth()
    const router = useRouter()

    const handleLogout = async () => {
        await logout()
        router.push("/login")
    }

    return (
        <SidebarPrimitive>
            <SidebarContent>
                <SidebarHeader className="p-4">
                    <Image src="https://aneto.com.br/wp-content/uploads/2025/05/logo.svg" alt="Logo" width={180} height={100} className="w-auto h-12" />
                </SidebarHeader>
                <SidebarMenu className="space-y-2 p-4">
                    <SidebarMenuItem>
                        <SidebarItem icon={<HomeIcon className="h-4 w-4" />} label="Dashboard" href="/dashboard" isActive={true} onClick={() => router.push("/dashboard")} />
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarItem icon={<ThermometerIcon className="h-4 w-4" />} label="Temperaturas" href="/temperatures" isActive={false} onClick={() => router.push("/temperatures")} />
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarItem icon={<SettingsIcon className="h-4 w-4" />} label="Configurações" href="/settings" isActive={false} onClick={() => router.push("/settings")} />
                    </SidebarMenuItem>
                    <SidebarMenuItem className="mt-auto">
                        <SidebarItem icon={<LogOutIcon className="h-4 w-4" />} label="Sair" href="#" isActive={false} onClick={handleLogout} />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
        </SidebarPrimitive>
    )
}