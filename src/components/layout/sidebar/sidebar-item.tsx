import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SidebarItemProps {
    icon: React.ReactNode
    label: string
    href: string
    isActive: boolean
    isLogout?: boolean
    onClick: () => void
}

export default function SidebarItem ({ icon, label, href, isActive, isLogout, onClick }: SidebarItemProps) {
    const activeClass = "bg-sidebar-accent text-brand-blue border-l-2 border-l-brand-blue"
    const hoverClass = "hover:bg-sidebar-accent hover:text-brand-blue hover:cursor-pointer"

    const logoutClass = "text-red-500 hover:bg-red-500 hover:text-white w-52 hover:cursor-pointer"

    return (
        <Button variant="ghost" size="icon" className={cn("w-full justify-start px-4", isActive && activeClass, !isLogout && hoverClass, isLogout && logoutClass)} onClick={onClick}>
            {icon}
            <span>{label}</span>
        </Button>
    )
}