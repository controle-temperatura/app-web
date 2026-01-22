"use client"

import { Sidebar as SidebarPrimitive, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar"
import Image from "next/image"
import SidebarItem from "./sidebar-item"
import SidebarItemAccordion from "./sidebar-item-accordion"
import { HomeIcon, ThermometerIcon, SettingsIcon, LogOutIcon, SheetIcon, LayoutDashboardIcon, BellIcon, ListTreeIcon, FileTextIcon, UserIcon, ShieldIcon, PaletteIcon, GroupIcon, ChefHatIcon, UtensilsCrossedIcon } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export function Sidebar() {
    const { logout } = useAuth()
    const router = useRouter()

    const handleLogout = async () => {
        await logout()
        router.push("/login")
    }

    const settingsSubItems = [
        {
            label: "Empresa",
            icon: <ChefHatIcon className="h-4 w-4" />,
            href: "/settings/company",
            onClick: () => router.push("/settings/company")
        },
        {
            label: "Usuários",
            icon: <GroupIcon className="h-4 w-4" />,
            href: "/settings/users",
            onClick: () => router.push("/settings/users")
        },
        {
            label: "Setores",
            icon: <UtensilsCrossedIcon className="h-4 w-4" />,
            href: "/settings/sectors",
            onClick: () => router.push("/settings/sectors")
        }
    ]

    return (
        <SidebarPrimitive>
            <SidebarContent className="relative">
                <SidebarHeader className="p-4">
                    <Image src="https://aneto.com.br/wp-content/uploads/2025/05/logo.svg" alt="Logo" width={180} height={100} className="w-auto h-12" />
                </SidebarHeader>
                <SidebarMenu className="space-y-2 p-4">
                    <SidebarMenuItem>
                        <SidebarItem icon={<LayoutDashboardIcon className="h-4 w-4" />} label="Dashboard" href="/dashboard" isActive={true} onClick={() => router.push("/dashboard")} />
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarItem icon={<SheetIcon className="h-4 w-4" />} label="Tabelas" href="/temperatures" isActive={false} onClick={() => router.push("/temperatures")} />
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarItem icon={<FileTextIcon className="h-4 w-4" />} label="Relatórios" href="/reports" isActive={false} onClick={() => router.push("/reports")} />
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarItem icon={<BellIcon className="h-4 w-4" />} label="Alertas" href="/alerts" isActive={false} onClick={() => router.push("/alerts")} />
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarItem icon={<ListTreeIcon className="h-4 w-4" />} label="Alimentos" href="/foods" isActive={false} onClick={() => router.push("/foods")} />
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarItemAccordion 
                            icon={<SettingsIcon className="h-4 w-4" />} 
                            label="Settings" 
                            subItems={settingsSubItems}
                            isActive={false}
                        />
                    </SidebarMenuItem>
                    <SidebarMenuItem className="absolute bottom-4">
                        <SidebarItem icon={<LogOutIcon className="h-4 w-4" />} label="Sair" href="#" isActive={false} onClick={handleLogout} isLogout />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
        </SidebarPrimitive>
    )
}