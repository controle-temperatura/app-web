'use client';

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import AlertCard from "./card";
import { Column, DataTable, Pagination, PaginationInfo } from "@/components/shared/data-table";
import { AlertTriangleIcon, CheckCircle2Icon, Clock3Icon, EyeIcon, FileTextIcon, TrendingUpIcon, UserCheck2Icon, UserIcon, UtensilsCrossedIcon, WrenchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { SaladIcon, ThermometerIcon } from "lucide-react";
import { CalendarDaysIcon } from "lucide-react";
import { GaugeIcon } from "lucide-react";

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

    const [isCorrectiveActionModalOpen, setIsCorrectiveActionModalOpen] = useState(false);
    const [selectedAlertToCorrectiveAction, setSelectedAlertToCorrectiveAction] = useState<any | null>(null);
    const [correctedTemperature, setCorrectedTemperature] = useState<number | null>(null);
    const [correctiveAction, setCorrectiveAction] = useState("");

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedAlertToView, setSelectedAlertToView] = useState<any | null>(null);
    const [viewMode, setViewMode] = useState<"alert" | "correction">("alert");
    
    const handleCorrectiveActionRecord = async(record: any) => {
        const recordData: any = await api.get(`/alerts/${record.id}`);

        setSelectedAlertToCorrectiveAction(recordData);
        setCorrectedTemperature(null);
        setCorrectiveAction("");
        setIsCorrectiveActionModalOpen(true);
    }

    const handleConfirmCorrectiveAction = async() => {
        if (!correctedTemperature || !correctiveAction) {
            toast.error("Preencha todos os campos obrigatórios");
            return;
        }
        const response: any = await api.patch(`/alerts/${selectedAlertToCorrectiveAction?.id}/resolve`, {
            correctedTemperature: correctedTemperature,
            correctiveAction: correctiveAction,
        });
        toast.success("Ação corretiva realizada com sucesso");

        fetchAlterationsHistory(1);
        setIsCorrectiveActionModalOpen(false);
        fetchAlerts(1);
        setCorrectedTemperature(null);
        setCorrectiveAction("");
        setSelectedAlertToCorrectiveAction(null);
    }

    const handleViewRecord = async(record: any) => {
        setViewMode("alert");
        const recordData: any = await api.get(`/alerts/${record.id}`);
        setSelectedAlertToView(recordData);
        setIsViewModalOpen(true);
    }
    
    const handleViewCorrectionRecord = async(record: any) => {
        setViewMode("correction");
        const recordData: any = await api.get(`/alerts/${record.id}`);
        setSelectedAlertToView(recordData);
        setIsViewModalOpen(true);
    }

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
                    <Button variant="ghost" size="icon" className="w-6 h-6 hover:bg-transparent hover:cursor-pointer" onClick={() => handleCorrectiveActionRecord(record)}>
                        <WrenchIcon className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-6 h-6 hover:bg-transparent hover:cursor-pointer" onClick={() => handleViewRecord(record)}>
                        <EyeIcon className="w-4 h-4" />
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
            header: "Corrigido em",
            accessor: "correctedAt"
        },
        {
            header: "Ação Corretiva",
            cell: (record) => (
                <Button variant="ghost" size="icon" className="w-6 h-6 hover:bg-transparent hover:cursor-pointer" onClick={() => handleViewCorrectionRecord(record)}>
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
            
            <Dialog
                open={isViewModalOpen}
                onOpenChange={setIsViewModalOpen}   
            >
                <DialogContent className="sm:max-w-[720px]">
                    <DialogHeader>
                        <DialogTitle>Visualizar Registro</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <div className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="flex items-center gap-1.5 text-sm text-gray-500">
                                        <SaladIcon className="h-4 w-4 text-gray-400" />
                                        Alimento
                                    </p>
                                    <p className="text-base font-semibold text-gray-900">{selectedAlertToView?.food || "-"}</p>
                                </div>
                                <span
                                    className={
                                        selectedAlertToView?.status === "CRITICAL"
                                            ? "rounded-full bg-red-500/10 px-3 py-1 text-sm font-medium text-red-600"
                                            : selectedAlertToView?.status === "ALERT"
                                            ? "rounded-full bg-yellow-500/10 px-3 py-1 text-sm font-medium text-yellow-600"
                                            : "rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-600"
                                    }
                                >
                                    <AlertTriangleIcon className="mr-1 inline h-3.5 w-3.5" />
                                    {selectedAlertToView?.statusLabel || "-"}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm text-gray-700 sm:grid-cols-3">
                                <div>
                                    <p className="flex items-center gap-1.5 text-gray-500">
                                        <UtensilsCrossedIcon className="h-4 w-4 text-gray-400" />
                                        Setor
                                    </p>
                                    <p className="font-medium text-gray-900">{selectedAlertToView?.sector || "-"}</p>
                                </div>
                                <div>
                                    <p className="flex items-center gap-1.5 text-gray-500">
                                        <ThermometerIcon className="h-4 w-4 text-gray-400" />
                                        Temperatura
                                    </p>
                                    <p className="font-medium text-gray-900">{selectedAlertToView?.temperature || "-"}</p>
                                </div>
                                <div>
                                    <p className="flex items-center gap-1.5 text-gray-500">
                                        <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                                        Data
                                    </p>
                                    <p className="font-medium text-gray-900">{selectedAlertToView?.createdAt || "-"}</p>
                                </div>
                                <div className="">
                                    <p className="flex items-center gap-1.5 text-gray-500">
                                        <UserIcon className="h-4 w-4 text-gray-400" />
                                        Responsável
                                    </p>
                                    <p className="font-medium text-gray-900">{selectedAlertToView?.user || "-"}</p>
                                </div>
                                {
                                    selectedAlertToView?.alert && (
                                        <>
                                            <div className="">
                                                <p className="flex items-center gap-1.5 text-gray-500">
                                                    <GaugeIcon className="h-4 w-4 text-gray-400" />
                                                    Temperatura Recomendada
                                                </p>
                                                <p className="font-medium text-gray-900">{selectedAlertToView?.defaultInterval || "-"}</p>
                                            </div>
                                            {
                                                selectedAlertToView?.status === "CRITICAL" && (
                                                    <div className="">
                                                        <p className="flex items-center gap-1.5 text-gray-500">
                                                            <TrendingUpIcon className="h-4 w-4 text-gray-400" />
                                                            Desvio
                                                        </p>
                                                        <p className="font-medium text-gray-900">{selectedAlertToView?.deviation ?? "-"}</p>
                                                    </div>
                                                )
                                            }
                                        </>
                                    )
                                }
                            </div>
                        </div>

                        {viewMode === "correction" && (
                            <div className="grid gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <div className="flex items-center justify-between">
                                    <p className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                        <AlertTriangleIcon className="h-4 w-4 text-gray-500" />
                                        Alerta
                                    </p>
                                    <span className="rounded-full bg-gray-900/10 px-3 py-1 text-xs font-semibold text-gray-700">
                                        {selectedAlertToView?.alert || "Sem alerta"}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm text-gray-700 sm:grid-cols-3">
                                    <div>
                                        <p className="flex items-center gap-1.5 text-gray-500">
                                            <ThermometerIcon className="h-4 w-4 text-gray-400" />
                                            Temperatura corrigida
                                        </p>
                                        <p className="font-medium text-gray-900">{selectedAlertToView?.correctedTemperature ?? "-"}</p>
                                    </div>
                                    <div>
                                        <p className="flex items-center gap-1.5 text-gray-500">
                                            <CheckCircle2Icon className="h-4 w-4 text-gray-400" />
                                            Corrigido
                                        </p>
                                        <p className="font-medium text-gray-900">
                                            {selectedAlertToView?.resolved == null ? "-" : selectedAlertToView.resolved ? "Sim" : "Não"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="flex items-center gap-1.5 text-gray-500">
                                            <Clock3Icon className="h-4 w-4 text-gray-400" />
                                            Corrigido em
                                        </p>
                                        <p className="font-medium text-gray-900">{selectedAlertToView?.resolvedAt || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="flex items-center gap-1.5 text-gray-500">
                                            <UserCheck2Icon className="h-4 w-4 text-gray-400" />
                                            Corrigido por
                                        </p>
                                        <p className="font-medium text-gray-900">{selectedAlertToView?.resolvedBy || "-"}</p>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <p className="flex items-center gap-1.5 text-gray-500">
                                            <WrenchIcon className="h-4 w-4 text-gray-400" />
                                            Ação corretiva
                                        </p>
                                        <p className="font-medium text-gray-900">
                                            {selectedAlertToView?.correctiveAction || "-"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                    </div>
                </DialogContent>

            </Dialog>

            <Dialog
                open={isCorrectiveActionModalOpen}
                onOpenChange={setIsCorrectiveActionModalOpen}
            >
                <DialogContent className="sm:max-w-[720px]">
                    <DialogHeader>
                        <DialogTitle>Resolver Alerta</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <div className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="flex items-center gap-1.5 text-sm text-gray-500">
                                        <SaladIcon className="h-4 w-4 text-gray-400" />
                                        Alimento
                                    </p>
                                    <p className="text-base font-semibold text-gray-900">
                                        {selectedAlertToCorrectiveAction?.food || "-"}
                                    </p>
                                </div>
                                <span
                                    className={
                                        selectedAlertToCorrectiveAction?.status === "CRITICAL"
                                            ? "rounded-full bg-red-500/10 px-3 py-1 text-sm font-medium text-red-600"
                                            : selectedAlertToCorrectiveAction?.status === "ALERT"
                                            ? "rounded-full bg-yellow-500/10 px-3 py-1 text-sm font-medium text-yellow-600"
                                            : "rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-600"
                                    }
                                >
                                    <AlertTriangleIcon className="mr-1 inline h-3.5 w-3.5" />
                                    {selectedAlertToCorrectiveAction?.statusLabel || "-"}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm text-gray-700 sm:grid-cols-3">
                                <div>
                                    <p className="flex items-center gap-1.5 text-gray-500">
                                        <ThermometerIcon className="h-4 w-4 text-gray-400" />
                                        Temperatura
                                    </p>
                                    <p className="font-medium text-gray-900">
                                        {selectedAlertToCorrectiveAction?.temperature || "-"}
                                    </p>
                                </div>
                                <div>
                                    <p className="flex items-center gap-1.5 text-gray-500">
                                        <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                                        Data
                                    </p>
                                    <p className="font-medium text-gray-900">
                                        {selectedAlertToCorrectiveAction?.createdAt || "-"}
                                    </p>
                                </div>
                                <div>
                                    <p className="flex items-center gap-1.5 text-gray-500">
                                        <GaugeIcon className="h-4 w-4 text-gray-400" />
                                        Temperatura Recomendada
                                    </p>
                                    <p className="font-medium text-gray-900">
                                        {selectedAlertToCorrectiveAction?.defaultInterval || "-"}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="grid gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <div className="flex items-center justify-between">
                                <p className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                    <WrenchIcon className="h-4 w-4 text-gray-500" />
                                    Correção
                                </p>
                                <span className="text-xs text-gray-500">Preencha os campos obrigatórios</span>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <label className="flex items-center gap-1.5 text-sm text-gray-500">
                                        <ThermometerIcon className="h-4 w-4 text-gray-400" />
                                        Temperatura Corrigida
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            value={correctedTemperature ?? ""}
                                            onChange={(event) => setCorrectedTemperature(Number(event.target.value))}
                                            placeholder="Ex: 4"
                                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                        <span className="text-xs text-primary">°C</span>
                                    </div>
                                    <span className="text-xs text-gray-500">* Temperatura corrigida em graus Celsius</span>
                                </div>
                                <div className="grid gap-2 sm:col-span-2">
                                    <label className="flex items-center gap-1.5 text-sm text-gray-500">
                                        <WrenchIcon className="h-4 w-4 text-gray-400" />
                                        Ação Corretiva
                                    </label>
                                    <textarea
                                        className="min-h-[96px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 resize-none"
                                        value={correctiveAction}
                                        onChange={(event) => setCorrectiveAction(event.target.value)}
                                        placeholder="Descreva a ação corretiva"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCorrectiveActionModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleConfirmCorrectiveAction}>
                            Confirmar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}