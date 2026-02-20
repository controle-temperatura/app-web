'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sector } from '@/components/shared/sector';
import { ChevronLeftIcon, ChevronRightIcon, Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';

const SM_BREAKPOINT = 640;

function useIsSmOrSmaller() {
    const [isSm, setIsSm] = useState(false);
    useEffect(() => {
        const mql = window.matchMedia(`(max-width: ${SM_BREAKPOINT - 1}px)`);
        const onChange = () => setIsSm(window.innerWidth < SM_BREAKPOINT);
        mql.addEventListener('change', onChange);
        setIsSm(window.innerWidth < SM_BREAKPOINT);
        return () => mql.removeEventListener('change', onChange);
    }, []);
    return isSm;
}

interface Sector {
    id: string;
    name: string;
    icon?: string;
    [key: string]: unknown;
}

interface SectorsResponse {
    sectors: Sector[];
    totalPages: number;
}

export default function MeasurementSectorsPage() {
    const router = useRouter();
    const isSmOrSmaller = useIsSmOrSmaller();
    const [sectors, setSectors] = useState<Sector[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const limit = isSmOrSmaller ? 8 : 9;

    const fetchData = useCallback(async (page: number) => {
        setIsLoading(true);
        try {
            const timestamp = new Date().getTime();
            const response = await api.get<any>(
                `/sectors/active?page=${page}&limit=${limit}&_t=${timestamp}`
            );
            setSectors(response.sectors ?? []);
            setTotalPages(response.pagination.totalPages ?? 1);
        } catch (error) {
            toast.error('Erro ao buscar setores');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        fetchData(currentPage);
    }, [currentPage, fetchData]);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
        }
    };

    return (
        <div className="flex flex-1 flex-col gap-6">
            <div className="flex flex-row items-center gap-4 sm:gap-6">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0">
                    <ChevronLeftIcon className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-bold sm:text-2xl">Registrar Temperatura</h1>
            </div>

            {isLoading ? (
                <div className="flex min-h-[200px] flex-1 items-center justify-center sm:min-h-[280px]">
                    <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:gap-5">
                        {sectors?.map((sector) => (
                            <Link
                                key={sector.id}
                                href={`/measurement/sectors/${sector.id}`}
                                className="block"
                            >
                                <Card className="flex h-full min-h-[100px] cursor-pointer items-center justify-center border border-border shadow-sm transition-colors hover:bg-muted/50 sm:min-h-[120px]">
                                    <CardContent className="flex items-center justify-center p-4 sm:p-5">
                                        <Sector sector={{ name: sector.name, icon: sector.icon }} />
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>

                    <div className="flex flex-row items-center justify-between border-t border-border py-4 sm:py-5">
                        <Button
                            variant="secondary"
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className="gap-2 sm:px-5"
                        >
                            <ChevronLeftIcon className="h-5 w-5" />
                            Anterior
                        </Button>
                        <span className="text-sm font-medium sm:text-base">
                            Página {currentPage} de {totalPages}
                        </span>
                        <Button
                            variant="secondary"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="gap-2 sm:px-5"
                        >
                            Próxima
                            <ChevronRightIcon className="h-5 w-5" />
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
