"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useLogin } from "@/hooks/use-login"
import { toast } from "sonner"
import { useCompany } from "@/hooks/use-company"

interface LoginFormProps {
    company: any
}

export default function LoginForm({ company }: LoginFormProps) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const { handleLogin, isLoading, error } = useLogin()

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!email || !password) {
            toast.error("Por favor, preencha todos os campos")
            return
        }

        await handleLogin(email, password)
        
        if (error) {
            toast.error(error)
        }

        toast.success("Login realizado com sucesso")
    }

    return (
        <Card className="h-120 w-96 flex flex-col justify-center rounded-r-none">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-3xl font-bold">Bem vindo!</CardTitle>
                <CardDescription className="text-md">Entre na sua conta {company?.shortName}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input
                            type="email"
                            placeholder="email@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Senha</label>
                            <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                                Esqueceu sua senha?
                            </Link>
                        </div>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    {error && (
                        <div className="text-sm text-red-500 text-center">
                            {error}
                        </div>
                    )}

                    <Button 
                        type="submit" 
                        className="w-full hover:cursor-pointer" 
                        disabled={isLoading}
                    >
                        {isLoading ? "Entrando..." : "Entrar"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
