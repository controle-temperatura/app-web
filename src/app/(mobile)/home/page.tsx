'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertComponent } from '@/components/shared/alert';
import {
    CalendarIcon,
    ChevronLeftIcon,
    SearchIcon,
    ThermometerIcon,
    SprayCanIcon,
    AlertCircleIcon,
} from 'lucide-react';

interface AlertItem {
    id: string;
    title?: string;
    type: string;
    item?: string;
    description?: string;
    registeredTemperature?: number;
    recommendedTemperature?: number;
}


export default function HomePage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const date = new Date();
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    const dateForRequest = `${year}-${month}-${day}`;
    const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' }).charAt(0).toUpperCase() + date.toLocaleDateString('pt-BR', { weekday: 'long' }).slice(1);

    const [userMeasurements, setUserMeasurements] = useState<number>(0);
    const [alerts, setAlerts] = useState<AlertItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchUserMeasurements = useCallback(async () => {
        setIsLoading(true);
        try {
            const timestamp = new Date().getTime();
            const response = await api.get<number | unknown[]>(
                `/users/measurements?date=${dateForRequest}&_t=${timestamp}`
            );
            setUserMeasurements(
                typeof response === 'number' ? response : Array.isArray(response) ? response.length : 0
            );
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [dateForRequest]);

    const fetchAlerts = useCallback(async () => {
        setIsLoading(true);
        try {
            const timestamp = new Date().getTime();
            const response = await api.get<AlertItem[] | null>(
                `/alerts/home?date=${dateForRequest}&_t=${timestamp}`
            );
            setAlerts(response ?? []);
        } catch (error) {
            console.error('Error fetching alerts:', error);
            setAlerts([]);
        } finally {
            setIsLoading(false);
        }
    }, [dateForRequest]);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
            return;
        }
        if (isAuthenticated) {
            fetchUserMeasurements();
            fetchAlerts();
        }
    }, [authLoading, isAuthenticated, router, fetchUserMeasurements, fetchAlerts]);

    if (authLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <p className="text-muted-foreground">Carregando...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="flex flex-col gap-4 sm:gap-5 md:gap-6">
            <div className="flex flex-row items-center gap-4 sm:gap-6">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="shrink-0"
                    aria-label="Voltar"
                >
                    <ChevronLeftIcon className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-bold sm:text-2xl">Início</h1>
            </div>
            <Card className="border border-border shadow-sm">
                <CardHeader className="pb-2">
                    <div className="flex flex-row items-center gap-2">
                        <CalendarIcon className="h-5 w-5 shrink-0 text-foreground" />
                        <CardTitle className="text-xl sm:text-2xl">{weekday} - {formattedDate}</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-row justify-between">
                        <span className="text-muted-foreground">Medições realizadas hoje</span>
                        <span className="font-medium">
                            {isLoading ? '...' : userMeasurements}
                        </span>
                    </div>
                </CardContent>
            </Card>

            <Card className="border border-border shadow-sm">
                <CardHeader className="pb-2">
                    <div className="flex flex-row items-center gap-2">
                        <SearchIcon className="h-5 w-5 text-foreground" />
                        <CardTitle className="text-xl sm:text-2xl">Realizar Medição</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 sm:gap-4">
                    <Button variant="outline" className="h-11 w-full justify-center gap-2 sm:h-12 sm:text-base" asChild>
                        <Link href="/measurement/sectors">
                            <ThermometerIcon className="h-5 w-5" />
                            Registrar Temperatura
                        </Link>
                    </Button>
                    <Button variant="outline" className="h-11 w-full justify-center gap-2 sm:h-12 sm:text-base" disabled>
                        <SprayCanIcon className="h-5 w-5" />
                        Registrar Higienização
                    </Button>
                </CardContent>
            </Card>

            <Card className="border border-border shadow-sm">
                <CardHeader className="pb-2">
                    <div className="flex flex-row items-center gap-2">
                        <AlertCircleIcon className="h-5 w-5 text-foreground" />
                        <CardTitle className="text-lg sm:text-xl">Alertas</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    {alerts && alerts.length > 0 ? (
                        <div className="flex flex-col gap-3 md:gap-4">
                            {alerts.map((alert) => (
                                <AlertComponent
                                    key={alert.id}
                                    title={
                                        alert.title ??
                                        (alert.type === 'CRITICAL'
                                            ? 'Temperatura Crítica'
                                            : 'Atenção')
                                    }
                                    item={alert.item ?? '–'}
                                    description={alert.description ?? '–'}
                                    registeredTemperature={
                                        alert.registeredTemperature != null
                                            ? String(alert.registeredTemperature)
                                            : '–'
                                    }
                                    recommendedTemperature={
                                        alert.recommendedTemperature != null
                                            ? String(alert.recommendedTemperature)
                                            : '–'
                                    }
                                    type={
                                        alert.type === 'CRITICAL' ? 'CRITICAL' : 'ALERT'
                                    }
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground">
                            Nenhum alerta no momento
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
