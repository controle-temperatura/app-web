'use client';

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import AlertCard from "./card";
import { Column, DataTable, Pagination, PaginationInfo } from "@/components/shared/data-table";
import { EyeOffIcon, FileTextIcon, WrenchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AlertsPage() {

    const date = new Date();
    const formattedDate = date.toISOString().split('T')[0];

    const [isLoading, setIsLoading] = useState(true);
    const [alertCards, setAlertCards] = useState<any[]>([]);
    
    const [alerts, setAlerts] = useState<any[]>([]);
    const [alertsPagination, setAlertsPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 10,
        totalRecords: 0,
        totalPages: 0,
    });

    const [correctionsHistory, setCorrectionsHistory] = useState<any[]>([]);
    const [correctionsHistoryPagination, setCorrectionsHistoryPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 10,
        totalRecords: 0,
        totalPages: 0,
    });
    
    useEffect(() => {
        fetchAlertCards();
        fetchAlerts();
        fetchAlterationsHistory();
    }, []);

    const fetchAlertCards = async () => {
        setIsLoading(true);
        const date = new Date();
        const formattedDate = date.toISOString().split('T')[0];
        try {
            const response: any = await api.get(`/dashboard/alerts?date=${formattedDate}`);
            setAlertCards(response);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    const fetchAlerts = useCallback(async (page: number = 1) => {
        
        setIsLoading(true);
        try {
            const response: any = await api.get(`/alerts/tables?page=${page}&limit=10&date=${formattedDate}`);
            setAlerts(response.data);
            setAlertsPagination(response.pagination);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [alertsPagination.limit, formattedDate]);

    const fetchAlterationsHistory = useCallback(async (page: number = 1) => {
        setIsLoading(true);
        try {
            const response: any = await api.get(`/alerts/corrections?page=${page}&limit=10&date=${formattedDate}`);
            setCorrectionsHistory(response.data);
            setCorrectionsHistoryPagination(response.pagination);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [correctionsHistoryPagination.limit, formattedDate]);

    const handlePendingAlertsPageChange = useCallback((page: number) => {
        if (page >= 1 && page <= alertsPagination.totalPages) {
            fetchAlerts(page);
        }
    }, [alertsPagination.totalPages, fetchAlerts]);

    const handleCorrectionsHistoryPageChange = useCallback((page: number) => {
        if (page >= 1 && page <= correctionsHistoryPagination.totalPages) {
            fetchAlterationsHistory(page);
        }
    }, [correctionsHistoryPagination.totalPages, fetchAlterationsHistory]);

    const alertCardColors: any = {
        "CRITICAL": { textColor: 'destructive', backgroundColor: 'bg-destructive/10' },
        "ALERT": { textColor: 'yellow-500', backgroundColor: 'bg-yellow-500/10' },
        "RESOLVED": { textColor: 'green-500', backgroundColor: 'bg-green-500/10' },
        "PENDING": { textColor: 'blue-500', backgroundColor: 'bg-blue-500/10' },
    }

    const pendingAlertsColumns: Column<any>[] = [
        {
            header: "Alimento",
            accessor: "food"
        },
        {
            header: "Setor",
            accessor: "sector"
        },
        {
            header: "Valor Registrado",
            accessor: "temperature"
        },
        {
            header: "Valor Padrão",
            accessor: "defaultInterval"
        },
        {
            header: "Desvio",
            accessor: "deviation"
        },
        {
            header: "Data",
            accessor: "createdAt"
        },
        {
            header: "Ação",
            cell: (record) => (
                <>
                    <Button variant="ghost" size="icon" className="w-6 h-6 hover:bg-transparent hover:cursor-pointer">
                        <WrenchIcon className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-6 h-6 hover:bg-transparent hover:cursor-pointer">
                        <EyeOffIcon className="w-4 h-4" />
                    </Button>
                </>
            )
        }
    ]

    const correctionHistoryColumns: Column<any>[] = [
        {
            header: "Alimento",
            accessor: "food"
        },
        {
            header: "Setor",
            accessor: "sector"
        },
        {
            header: "Valor Inicial",
            accessor: "temperature"
        },
        {
            header: "Valor Corrigido",
            accessor: "correctedTemperature"
        },
        {
            header: "Corrigido por",
            accessor: "correctedBy"
        },
        {
            header: "Data",
            accessor: "createdAt"
        },
        {
            header: "Ação Corretiva",
            cell: (record) => (
                <Button variant="ghost" size="icon" className="w-6 h-6 hover:bg-transparent hover:cursor-pointer">
                    <FileTextIcon className="w-4 h-4" /> 
                    Visualizar
                </Button>
            )
        }
    ]

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {
                    alertCards?.map((alert) => (
                        <AlertCard key={alert.id} title={alert.title} description={alert.description} data={alert.data} textColor={alertCardColors[alert.type].textColor} backgroundColor={alertCardColors[alert.type].backgroundColor} />
                    ))
                }
            </div>

            <div className="flex flex-col gap-2">
                <h2 className="text-lg font-bold">Alertas Pendentes</h2>
                <DataTable 
                    columns={pendingAlertsColumns}
                    data={alerts}
                    getRowKey={(record) => record.id}
                    isLoading={isLoading}
                />
                <Pagination
                    pagination={alertsPagination}
                    onPageChange={handlePendingAlertsPageChange}
                    disabled={isLoading}
                    recordsCount={alertsPagination.totalRecords}
                />
            </div>
            
            <div className="flex flex-col gap-2">
                <h2 className="text-lg font-bold">Histórico de Correções</h2>
                <DataTable 
                    columns={correctionHistoryColumns}
                    data={correctionsHistory}
                    getRowKey={(record) => record.id}
                    isLoading={isLoading}
                />
                <Pagination
                    pagination={correctionsHistoryPagination}
                    onPageChange={handleCorrectionsHistoryPageChange}
                    disabled={isLoading}
                    recordsCount={correctionsHistoryPagination.totalRecords}
                />
            </div>
            
        </div>
    )
}