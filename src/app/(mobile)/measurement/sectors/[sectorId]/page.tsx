'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ChevronLeftIcon } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Food {
    id: string;
    name: string;
}

interface SectorResponse {
    name?: string;
    foods: Food[];
}

export default function RegisterTemperaturePage() {
    const params = useParams();
    const router = useRouter();
    const sectorId = typeof params.sectorId === 'string' ? params.sectorId : params.sectorId?.[0];

    const [sector, setSector] = useState<SectorResponse | null>(null);
    const [foods, setFoods] = useState<Food[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFood, setSelectedFood] = useState<string | null>(null);
    const [temperature, setTemperature] = useState('');
    const [observations, setObservations] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);

    const fetchFoods = useCallback(async () => {
        if (!sectorId) return;
        setIsLoading(true);
        try {
            const timestamp = new Date().getTime();
            const response = await api.get<SectorResponse>(
                `/sectors/${sectorId}/foods?_t=${timestamp}`
            );
            setSector(response);
            setFoods(response.foods ?? []);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao carregar alimentos');
        } finally {
            setIsLoading(false);
        }
    }, [sectorId]);

    useEffect(() => {
        fetchFoods();
    }, [fetchFoods]);

    const handleRegisterTemperature = async () => {
        if (!selectedFood) {
            toast.error('Selecione um alimento');
            return;
        }
        const tempNum = Number(temperature);
        if (Number.isNaN(tempNum)) {
            toast.error('Informe uma temperatura válida');
            return;
        }
        setIsRegistering(true);
        try {
            await api.post('/temperature-records', {
                foodId: selectedFood,
                temperature: tempNum,
            });
            toast.success('Temperatura registrada com sucesso');
            router.back();
        } catch (error) {
            console.error(error);
            toast.error('Erro ao registrar temperatura');
        } finally {
            setIsRegistering(false);
        }
    };

    if (!sectorId) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center p-4">
                <p className="text-muted-foreground">Setor não encontrado.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col gap-4 sm:gap-5 md:gap-6">
            <div className="flex flex-row items-center gap-4 sm:gap-6">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0">
                    <ChevronLeftIcon className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-bold sm:text-2xl truncate">{sector?.name ?? 'Carregando...'}</h1>
            </div>

            {isLoading ? (
                <div className="flex min-h-[200px] flex-1 items-center justify-center py-12">
                    <p className="text-muted-foreground">Carregando alimentos...</p>
                </div>
            ) : (
                <>
                    <Card className="border border-border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xl sm:text-2xl">Selecionar</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-2 sm:gap-3">
                                {foods?.map((food) => (
                                    <button
                                        key={food.id}
                                        type="button"
                                        onClick={() => setSelectedFood(food.id)}
                                        className={cn(
                                            'w-full rounded-lg border border-border px-4 py-3 text-center text-base font-semibold transition-colors sm:py-3.5',
                                            selectedFood === food.id
                                                ? 'border-foreground bg-foreground text-primary-foreground'
                                                : 'bg-transparent hover:bg-muted/50'
                                        )}
                                    >
                                        {food.name}
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border border-border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xl sm:text-2xl">Temperatura Medida</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative w-full">
                                <Input
                                    type="number"
                                    inputMode="decimal"
                                    placeholder="Ex: 12"
                                    value={temperature}
                                    onChange={(e) => setTemperature(e.target.value)}
                                    className="pr-12 text-xl font-bold"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xl font-bold text-muted-foreground">
                                    °C
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border border-border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xl sm:text-2xl">Observações</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <textarea
                                placeholder="Ex: A temperatura foi medida às 10:00"
                                value={observations}
                                onChange={(e) => setObservations(e.target.value)}
                                rows={4}
                                className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                            />
                        </CardContent>
                    </Card>

                    <Button
                        size="lg"
                        className="mt-4 w-full text-lg font-bold sm:mt-6 sm:h-12 sm:text-base"
                        onClick={handleRegisterTemperature}
                        disabled={isRegistering}
                    >
                        {isRegistering ? 'Registrando...' : 'Registrar Temperatura'}
                    </Button>
                </>
            )}
        </div>
    );
}
