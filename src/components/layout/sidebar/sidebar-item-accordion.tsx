"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronDownIcon } from "lucide-react"
import { SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from "@/components/ui/sidebar"

interface SubItem {
    label: string
    icon: React.ReactNode
    href: string
    onClick: () => void
}

interface SidebarItemAccordionProps {
    icon: React.ReactNode
    label: string
    subItems: SubItem[]
    isActive?: boolean
}

export default function SidebarItemAccordion({ 
    icon, 
    label, 
    subItems, 
    isActive = false 
}: SidebarItemAccordionProps) {
    const [isOpen, setIsOpen] = useState(false)
    const activeClass = "bg-sidebar-accent text-brand-blue border-l-2 border-l-brand-blue"
    const hoverClass = "hover:bg-sidebar-accent hover:text-brand-blue hover:cursor-pointer"

    return (
        <div className="w-full">
            <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                    "w-full justify-start px-4", 
                    isActive && activeClass, 
                    hoverClass
                )} 
                onClick={() => setIsOpen(!isOpen)}
            >
                {icon}
                <span className="flex-1 text-left">{label}</span>
                <ChevronDownIcon 
                    className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        isOpen && "rotate-180"
                    )}
                />
            </Button>
            
            {isOpen && (
                <SidebarMenuSub>
                    {subItems.map((subItem, index) => (
                        <SidebarMenuSubItem key={index}>
                            <SidebarMenuSubButton onClick={subItem.onClick}>
                                {subItem.icon}
                                <span>{subItem.label}</span>
                            </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                    ))}
                </SidebarMenuSub>
            )}
        </div>
    )
}
