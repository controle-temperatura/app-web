"use client"

// app/(auth)/login/page.tsx
import LoginForm from "./login-form"
import Image from "next/image"
import { useCompany } from "@/hooks/use-company"

export default function LoginPage() {

    const { company } = useCompany();

    return (
        <main className="flex min-h-screen items-center justify-center bg-muted p-4">
            <div className="w-full flex flex-col md:flex-row max-w-4xl items-center justify-center gap-0">
                <LoginForm company={company} />
                <div className="hidden md:flex w-full md:w-96 h-48 md:h-120 rounded-b-xl md:rounded-r-xl md:rounded-bl-none items-center justify-center bg-slate-200">
                    <Image src={company?.logoUrl || "https://aneto.com.br/wp-content/uploads/2025/05/logo.svg"} alt="Logo" width={200} height={100} />
                </div>
            </div>
        </main>
    )
}
