"use client"

// app/(auth)/login/page.tsx
import LoginForm from "./login-form"
import Image from "next/image"
import { useCompany } from "@/hooks/use-company"

export default function LoginPage() {

    const { company } = useCompany();

    return (
        <main className="flex min-h-screen items-center justify-center bg-muted">
            <div className="w-full flex max-w-4xl px-4 items-center justify-center">
                <LoginForm company={company} />
                <div className="w-96 h-120 rounded-r-xl flex items-center justify-center bg-slate-200">
                    <Image src={company?.logoUrl || "https://aneto.com.br/wp-content/uploads/2025/05/logo.svg"} alt="Logo" width={200} height={100} />
                </div>
            </div>
        </main>
    )
}
