"use client"

import { BellIcon, UserIcon } from "lucide-react"
import { useState } from "react"
import { useUser } from "@/hooks/use-user"
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface HeaderProps {
    title: string;
    notifications?: number;
}

export default function Header({ title, notifications }: HeaderProps) {
    const { user } = useUser()

    const date = new Date()
    const day = date.getDate()
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    const formattedDate = `${day}/${month}/${year}`

    return (
        <header className="flex items-center justify-between p-4 border-b border-border-light">
            <h1 className="text-2xl font-bold text-brand-blue">{title}</h1>
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{formattedDate}</span>
                <Button variant="ghost" size="icon">
                    <BellIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                    <Image src={user?.profilePicUrl ? user.profilePicUrl : "https://i0.wp.com/sbcf.fr/wp-content/uploads/2018/03/sbcf-default-avatar.png?ssl=1"} alt="User Avatar" width={46} height={46} className="rounded-full" />
                </Button>
            </div>
        </header>
    )
}