"use client"

import { Sidebar as SidebarPrimitive, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar"
import Image from "next/image"
import SidebarItem from "./sidebar-item"
import SidebarItemAccordion from "./sidebar-item-accordion"
import { HomeIcon, ThermometerIcon, SettingsIcon, LogOutIcon, SheetIcon, LayoutDashboardIcon, BellIcon, ListTreeIcon, FileTextIcon, UserIcon, ShieldIcon, PaletteIcon, GroupIcon, ChefHatIcon, UtensilsCrossedIcon, UsersIcon } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, usePathname } from "next/navigation"
import { useCompany } from "@/hooks/use-company"
import { useUser } from "@/hooks/use-user"

export function Sidebar() {
    const { logout } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const { user } = useUser()

    const handleLogout = async () => {
        await logout()
        router.push("/login")
    }

    const { company } = useCompany()

    const userRole = user?.role ?? "COLABORATOR"
    const isAdmin = userRole === "ADMIN"
    const isAuditor = userRole === "AUDITOR"

    const settingsSubItems = [
        {
            label: "Empresa",
            icon: <ChefHatIcon className="h-4 w-4" />,
            href: "/settings/company",
            onClick: () => router.push("/settings/company")
        },
        {
            label: "Usuários",
            icon: <UsersIcon className="h-4 w-4" />,
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

    const isSettingsActive = pathname?.startsWith('/settings') || false

    return (
        <SidebarPrimitive>
            <SidebarContent className="relative">
                <SidebarHeader className="p-4">
                    <Image src={company?.logoUrl || "https://freesvg.org/img/logo-generic.png"} alt="Logo" width={180} height={100} className="w-auto h-12" />
                </SidebarHeader>
                <SidebarMenu className="space-y-2 p-4">
                    <SidebarMenuItem>
                        <SidebarItem icon={<LayoutDashboardIcon className="h-4 w-4" />} label="Dashboard" href="/dashboard" isActive={pathname === '/dashboard'} onClick={() => router.push("/dashboard")} />
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarItem icon={<SheetIcon className="h-4 w-4" />} label="Tabelas" href="/tables" isActive={pathname === '/tables'} onClick={() => router.push("/tables")} />
                    </SidebarMenuItem>
                    {(isAdmin || isAuditor) && (
                        <SidebarMenuItem>
                            <SidebarItem icon={<FileTextIcon className="h-4 w-4" />} label="Relatórios" href="/reports" isActive={pathname === '/reports'} onClick={() => router.push("/reports")} />
                        </SidebarMenuItem>
                    )}
                    <SidebarMenuItem>
                        <SidebarItem icon={<BellIcon className="h-4 w-4" />} label="Alertas" href="/alerts" isActive={pathname === '/alerts'} onClick={() => router.push("/alerts")} />
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarItem icon={<ListTreeIcon className="h-4 w-4" />} label="Alimentos" href="/foods" isActive={pathname === '/foods'} onClick={() => router.push("/foods")} />
                    </SidebarMenuItem>
                    {isAdmin && (
                        <SidebarMenuItem>
                            <SidebarItemAccordion 
                                icon={<SettingsIcon className="h-4 w-4" />} 
                                label="Configurações" 
                                subItems={settingsSubItems}
                                isActive={isSettingsActive}
                            />
                        </SidebarMenuItem>
                    )}
                    <SidebarMenuItem className="absolute bottom-4">
                        <SidebarItem icon={<LogOutIcon className="h-4 w-4" />} label="Sair" href="#" isActive={false} onClick={handleLogout} isLogout />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
        </SidebarPrimitive>
    )
}