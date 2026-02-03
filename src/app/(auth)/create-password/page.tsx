"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCompany } from "@/hooks/use-company"
import { api } from "@/lib/api"
import { toast } from "sonner"

const MIN_PASSWORD_LENGTH = 6

export default function CreatePasswordPage() {
    const { company } = useCompany()
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get("token") ?? ""

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const onSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setError(null)

        if (!token) {
            setError("Token inválido ou ausente")
            return
        }

        if (password.length < MIN_PASSWORD_LENGTH) {
            setError(`A senha deve ter no mínimo ${MIN_PASSWORD_LENGTH} caracteres`)
            return
        }

        if (password !== confirmPassword) {
            setError("As senhas não conferem")
            return
        }

        try {
            setIsLoading(true)
            await api.post(
                "/users/create-password",
                { token, password },
                { requiresAuth: false }
            )
            toast.success("Senha criada com sucesso")
            router.push("/login")
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erro ao criar senha"
            setError(message)
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-muted">
            <div className="w-full flex max-w-4xl px-4 items-center justify-center">
                <Card className="h-120 w-96 flex flex-col justify-center rounded-r-none">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-3xl font-bold">Crie sua senha</CardTitle>
                        <CardDescription className="text-md">
                            Defina uma nova senha para acessar o sistema
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <form onSubmit={onSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Senha</label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading || !token}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Confirmar senha</label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={isLoading || !token}
                                />
                            </div>

                            {error && (
                                <div className="text-sm text-red-500 text-center">
                                    {error}
                                </div>
                            )}

                            {!token && !error && (
                                <div className="text-sm text-red-500 text-center">
                                    Token inválido ou ausente
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full hover:cursor-pointer"
                                disabled={isLoading || !token}
                            >
                                {isLoading ? "Salvando..." : "Criar senha"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
                <div className="w-96 h-120 rounded-r-xl flex items-center justify-center bg-slate-200">
                    <Image
                        src={company?.logoUrl || "https://aneto.com.br/wp-content/uploads/2025/05/logo.svg"}
                        alt="Logo"
                        width={200}
                        height={100}
                    />
                </div>
            </div>
        </main>
    )
}