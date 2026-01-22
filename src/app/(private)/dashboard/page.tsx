"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState, useMemo } from "react"
import { api } from "@/lib/api"
import { AlertCircleIcon, AlertTriangleIcon, CheckCircleIcon, WrenchIcon } from "lucide-react"
import DashboardCard from "./card"
import { PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function DashboardPage() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        setLoading(true)
        const date = new Date()
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const day = date.getDate()
        const formattedDate = `${year}-${month}-${day}`
        try {
            const response = await api.get(`/dashboard?date=${formattedDate}`)
            console.log(response)
            setData(response)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const cards = [
        {
            icon: <CheckCircleIcon className="h-6 w-6" />,
            value: data?.records?.length || 0,
            text: "Registros Hoje",
            color: "brand-blue",
        },
        {
            icon: <AlertTriangleIcon className="h-6 w-6" />,
            value: data?.alerts?.filter((alert: any) => alert.danger === "CRITICAL").length || 0,
            text: "Fora do Padrão",
            color: "destructive",
        },
        {
            icon: <AlertCircleIcon className="h-6 w-6" />,
            value: data?.alerts?.filter((alert: any) => alert.danger === "ALERT").length || 0,
            text: "Próximo do Limite",
            color: "orange",
        },
        {
            icon: <WrenchIcon className="h-6 w-6" />,
            value: data?.alerts.filter((alert: any) => alert.correctiveAction !== null).length || 0,
            text: "Ações Corretivas",
            color: "yellow",
        },
    ]

    const pieChartData = useMemo(() => {
        if (!data?.records || !data?.alerts) return []
        
        const critical = data.alerts.filter((alert: any) => alert.danger === "CRITICAL").length
        const alert = data.alerts.filter((alert: any) => alert.danger === "ALERT").length
        const noAlert = data.records.length - critical - alert
        
        return [
            { name: "Sem Alerta", value: noAlert, color: "#0066CC" },
            { name: "Crítico", value: critical, color: "#EF4444" },
            { name: "Alerta", value: alert, color: "#F59E0B" },
        ]
    }, [data])

    const alertDangersData = useMemo(() => {
        if (!data?.alerts) return []
        
        const critical = data.alerts.filter((alert: any) => alert.danger === "CRITICAL").length
        const alert = data.alerts.filter((alert: any) => alert.danger === "ALERT").length
        
        return [
            { danger: "CRÍTICO", amount: critical },
            { danger: "ALERTA", amount: alert },
        ]
    }, [data])

    const sectorData = useMemo(() => {
        if (!data?.alerts) return []
        
        const sectorMap: Record<string, { critical: number; alert: number; total: number }> = {}
        
        data.alerts.forEach((alert: any) => {
            const sectorName = alert.temperatureRecord?.food?.sector?.name
            
            if (!sectorMap[sectorName]) {
                sectorMap[sectorName] = { critical: 0, alert: 0, total: 0 }
            }

            console.log(sectorMap)
            console.log(alert)

            if (alert.danger === 'CRITICAL') {
                console.log("CRITICAL", alert.temperatureRecord.food.sector.name)
                sectorMap[sectorName].critical++
            } else if (alert.danger === 'ALERT') {
                console.log("ALERT", alert.temperatureRecord.food.sector.name)
                sectorMap[sectorName].alert++
            }
            
            sectorMap[sectorName].total++
        })
        
        return Object.entries(sectorMap).map(([sector, counts]) => ({
            sector,
            amount: counts.critical + counts.alert,
            critical: counts.critical,
            alert: counts.alert,
        }))
    }, [data])

    const resolvedData = useMemo(() => {
        if (!data?.alerts) return []
        
        const resolved = data.alerts.filter((alert: any) => alert.resolved).length
        const notResolved = data.alerts.filter((alert: any) => !alert.resolved).length
        
        return [
            { name: "Resolvido", value: resolved, color: "green" },
            { name: "Não Resolvido", value: notResolved, color: "red" },
        ]
    }, [data])

    const alertTypesData = useMemo(() => {
        if (!data?.alerts) return []
        
        const types = {
            BELOW_MIN: 0,
            ABOVE_MAX: 0,
            NEXT_MIN: 0,
            NEXT_MAX: 0,
        }
        
        data.alerts.forEach((alert: any) => {
            if (alert.type in types) {
                types[alert.type as keyof typeof types]++
            }
        })
        
        return [
            { type: "Abaixo Mínimo", amount: types.BELOW_MIN },
            { type: "Acima Máximo", amount: types.ABOVE_MAX },
            { type: "Próximo Mínimo", amount: types.NEXT_MIN },
            { type: "Próximo Máximo", amount: types.NEXT_MAX },
        ]
    }, [data])

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 p-4">
                {
                    cards.map((card) => (
                        <DashboardCard key={card.text} {...card} />
                    ))
                }
            </div>

            {loading ? (
                <div className="text-center p-8">Carregando dados...</div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 p-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Status dos Alertas</CardTitle>
                            <CardDescription>Distribuição de registros por status</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={pieChartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={(entry) => `${entry.name}: ${entry.value}`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pieChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Alertas por Nível de Perigo</CardTitle>
                            <CardDescription>Quantidade de alertas críticos e de alerta</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={alertDangersData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="danger" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="amount" fill="#0066CC" name="Quantidade" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Alertas por Setor</CardTitle>
                            <CardDescription>Total de alertas críticos e de alerta por setor</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={sectorData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="sector" type="category" width={100} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="critical" stackId="a" fill="#EF4444" name="Crítico" />
                                    <Bar dataKey="alert" stackId="a" fill="#F59E0B" name="Alerta" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Status de Resolução</CardTitle>
                            <CardDescription>Alertas resolvidos vs não resolvidos</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={resolvedData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={(entry) => `${entry.name}: ${entry.value}`}
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {resolvedData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Tipos de Alertas</CardTitle>
                            <CardDescription>Distribuição de alertas por tipo</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={alertTypesData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="type" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="amount" fill="#8B5CF6" name="Quantidade" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
