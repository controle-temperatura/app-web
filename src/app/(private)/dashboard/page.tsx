import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                Bem-vindo ao sistema de controle de temperatura
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Temperatura Atual</CardTitle>
                        <CardDescription>Média dos sensores</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">23.5°C</div>
                    </CardContent>
                    </Card>

                    <Card>
                    <CardHeader>
                        <CardTitle>Umidade</CardTitle>
                        <CardDescription>Nível atual</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">65%</div>
                    </CardContent>
                    </Card>

                    <Card>
                    <CardHeader>
                        <CardTitle>Status</CardTitle>
                        <CardDescription>Sistema</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">Ativo</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
