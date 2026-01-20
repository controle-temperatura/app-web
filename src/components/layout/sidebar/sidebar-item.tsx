import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SidebarItemProps {
    icon: React.ReactNode
    label: string
    href: string
    isActive: boolean
    onClick: () => void
}

export default function SidebarItem ({ icon, label, href, isActive, onClick }: SidebarItemProps) {
    return (
        <Button variant="ghost" size="icon" className={cn("w-full justify-start", isActive && "bg-sidebar-accent")} onClick={onClick}>
            {icon}
            <span>{label}</span>
        </Button>
    )
}