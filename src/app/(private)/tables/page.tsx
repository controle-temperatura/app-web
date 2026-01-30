"use client"

import { useEffect, useState, useCallback } from "react";
import Filters, { FilterValues } from "./filters";
import { api } from "@/lib/api";
import {
    AlertTriangle,
    CheckCircle2Icon,
    Clock3Icon,
    GaugeIcon,
    TrendingUpIcon,
    UserCheck2Icon,
    EyeIcon,
    WrenchIcon,
    SaladIcon,
    AlertTriangleIcon,
    UtensilsCrossedIcon,
    ThermometerIcon,
    UserIcon,
    CalendarDaysIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, Pagination, Column, PaginationInfo } from "@/components/shared/data-table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface RecordData {
    id: string | number;
    food: string;
    defaultInterval: string;
    deviation: string;
    sector: string;
    temperature: string;
    status: string;
    statusLabel: string;
    createdAt: string;
    user: string;
    alert?: string | null;
    correctedTemperature?: string | number | null;
    resolved?: boolean | null;
    resolvedAt?: string | null;
    resolvedBy?: string | null;
    correctiveAction?: string | null;
    alertId?: string | number | null;
}

export default function TablesPage() {
    
    const [recordsData, setRecordsData] = useState<RecordData[]>([]);
    const [recordsLoading, setRecordsLoading] = useState<boolean>(false);
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 10,
        totalRecords: 0,
        totalPages: 0,
    });
    const [filters, setFilters] = useState<FilterValues>({
        date: new Date().toISOString().split('T')[0],
        sectorId: "",
        foodId: "",
        alertType: "",
        danger: "",
        search: "",
    });

    const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
    const [isCorrectiveActionModalOpen, setIsCorrectiveActionModalOpen] = useState<boolean>(false);

    const [selectedRecord, setSelectedRecord] = useState<RecordData | null>(null);
    const [selectedRecordToCorrectiveAction, setSelectedRecordToCorrectiveAction] = useState<RecordData | null>(null);
    const [correctedTemperature, setCorrectedTemperature] = useState<number | null>(null);
    const [correctiveAction, setCorrectiveAction] = useState("");

    const fetchRecords = useCallback(async (page: number = 1, filterValues: FilterValues) => {
        setRecordsLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: pagination.limit.toString(),
            });

            if (filterValues.date) params.append('date', filterValues.date);
            if (filterValues.sectorId) params.append('sectorId', filterValues.sectorId);
            if (filterValues.foodId) params.append('foodId', filterValues.foodId);
            if (filterValues.alertType) params.append('alertType', filterValues.alertType);
            if (filterValues.danger) params.append('danger', filterValues.danger);
            if (filterValues.search) params.append('search', filterValues.search);

            const response: any = await api.get(`/temperature-records/tables?${params.toString()}`);
            setRecordsData(response.data);
            setPagination(response.pagination);
        } catch (error) {
            console.error("Error fetching records:", error);
        } finally {
            setRecordsLoading(false);
        }
    }, [pagination.limit]);

    const handleFilterChange = useCallback((newFilters: FilterValues) => {
        setFilters(newFilters);
    }, []);

    useEffect(() => {
        fetchRecords(1, filters);
    }, [filters, fetchRecords]);

    const handlePageChange = useCallback((newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchRecords(newPage, filters);
        }
    }, [pagination.totalPages, filters, fetchRecords]);

    const handleViewRecord = async(record: RecordData) => {
        const recordData: any = await api.get(`/temperature-records/${record.id}`);

        setSelectedRecord(recordData);
        setIsViewModalOpen(true);
    }

    const handleCorrectiveActionRecord = async(record: RecordData) => {
        const recordData: any = await api.get(`/temperature-records/${record.id}`);

        setSelectedRecordToCorrectiveAction(recordData);
        setCorrectedTemperature(null);
        setCorrectiveAction("");
        setIsCorrectiveActionModalOpen(true);
    }

    const handleCancelCorrectiveAction = () => {
        setIsCorrectiveActionModalOpen(false);
        setSelectedRecordToCorrectiveAction(null);
        setCorrectedTemperature(null);
        setCorrectiveAction("");
    }

    const handleConfirmCorrectiveAction = async() => {
        if (!correctedTemperature || !correctiveAction) {
            toast.error("Preencha todos os campos obrigatórios");
            return;
        }
        const response: any = await api.patch(`/alerts/${selectedRecordToCorrectiveAction?.alertId}/resolve`, {
            correctedTemperature: correctedTemperature,
            correctiveAction: correctiveAction,
        });
        toast.success("Ação corretiva realizada com sucesso");
        setIsCorrectiveActionModalOpen(false);
        fetchRecords(1, filters);
        setSelectedRecordToCorrectiveAction(null);
        setCorrectedTemperature(null);
        setCorrectiveAction("");
    }

    const columns: Column<RecordData>[] = [
        {
            header: "Alimento",
            accessor: "food",
        },
        {
            header: "Setor",
            accessor: "sector",
        },
        {
            header: "Temperatura",
            accessor: "temperature",
        },
        {
            header: "Status",
            cell: (record: RecordData) => (
                <span className={record.status === 'Crítico' ? 'text-red-500 bg-red-500/10 px-2 py-1 rounded-md' : record.status === 'Alerta' ? 'text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-md' : 'text-green-500 bg-green-500/10 px-2 py-1 rounded-md'}>
                    {record.status}
                </span>
            )
        },
        {
            header: "Data",
            accessor: "createdAt",
        },
        {
            header: "Responsável",
            accessor: "user",
        },
        {
            header: "Ações",
            cell: (record) => (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="w-6 h-6 hover:bg-transparent hover:cursor-pointer" onClick={() => handleViewRecord(record)}>
                        <EyeIcon className="w-6 h-6" />
                    </Button>
                    <Button disabled={!record.alert || record?.resolved} variant="ghost" size="icon" className="w-6 h-6 hover:bg-transparent hover:cursor-pointer" onClick={() => handleCorrectiveActionRecord(record)}>
                        <WrenchIcon className="w-6 h-6" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="flex flex-col gap-6">
            <Filters onFilterChange={handleFilterChange} />
            <div className="flex flex-col gap-2">
                <DataTable
                    columns={columns}
                    data={recordsData}
                    isLoading={recordsLoading}
                    getRowKey={(record) => record.id}
                    getRowClassName={(record) => 
                        record.status === 'Crítico' ? 'bg-red-300 hover:bg-red-300' : ''
                    }
                />
                <Pagination
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    disabled={recordsLoading}
                    recordsCount={recordsData.length}
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
                                    <p className="text-base font-semibold text-gray-900">{selectedRecord?.food || "-"}</p>
                                </div>
                                <span
                                    className={
                                        selectedRecord?.status === "CRITICAL"
                                            ? "rounded-full bg-red-500/10 px-3 py-1 text-sm font-medium text-red-600"
                                            : selectedRecord?.status === "ALERT"
                                            ? "rounded-full bg-yellow-500/10 px-3 py-1 text-sm font-medium text-yellow-600"
                                            : "rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-600"
                                    }
                                >
                                    <AlertTriangleIcon className="mr-1 inline h-3.5 w-3.5" />
                                    {selectedRecord?.statusLabel || "-"}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm text-gray-700 sm:grid-cols-3">
                                <div>
                                    <p className="flex items-center gap-1.5 text-gray-500">
                                        <UtensilsCrossedIcon className="h-4 w-4 text-gray-400" />
                                        Setor
                                    </p>
                                    <p className="font-medium text-gray-900">{selectedRecord?.sector || "-"}</p>
                                </div>
                                <div>
                                    <p className="flex items-center gap-1.5 text-gray-500">
                                        <ThermometerIcon className="h-4 w-4 text-gray-400" />
                                        Temperatura
                                    </p>
                                    <p className="font-medium text-gray-900">{selectedRecord?.temperature || "-"}</p>
                                </div>
                                <div>
                                    <p className="flex items-center gap-1.5 text-gray-500">
                                        <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                                        Data
                                    </p>
                                    <p className="font-medium text-gray-900">{selectedRecord?.createdAt || "-"}</p>
                                </div>
                                <div className="">
                                    <p className="flex items-center gap-1.5 text-gray-500">
                                        <UserIcon className="h-4 w-4 text-gray-400" />
                                        Responsável
                                    </p>
                                    <p className="font-medium text-gray-900">{selectedRecord?.user || "-"}</p>
                                </div>
                                {
                                    selectedRecord?.alert && (
                                        <>
                                            <div className="">
                                                <p className="flex items-center gap-1.5 text-gray-500">
                                                    <GaugeIcon className="h-4 w-4 text-gray-400" />
                                                    Temperatura Recomendada
                                                </p>
                                                <p className="font-medium text-gray-900">{selectedRecord?.defaultInterval || "-"}</p>
                                            </div>
                                            {
                                                selectedRecord?.status === "CRITICAL" && (
                                                    <div className="">
                                                        <p className="flex items-center gap-1.5 text-gray-500">
                                                            <TrendingUpIcon className="h-4 w-4 text-gray-400" />
                                                            Desvio
                                                        </p>
                                                        <p className="font-medium text-gray-900">{selectedRecord?.deviation ?? "-"}</p>
                                                    </div>
                                                )
                                            }
                                        </>
                                    )
                                }
                            </div>
                        </div>

                        {selectedRecord?.alert && (
                            <div className="grid gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <div className="flex items-center justify-between">
                                    <p className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                        <AlertTriangle className="h-4 w-4 text-gray-500" />
                                        Alerta
                                    </p>
                                    <span className="rounded-full bg-gray-900/10 px-3 py-1 text-xs font-semibold text-gray-700">
                                        {selectedRecord?.alert || "Sem alerta"}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm text-gray-700 sm:grid-cols-3">
                                    <div>
                                        <p className="flex items-center gap-1.5 text-gray-500">
                                            <ThermometerIcon className="h-4 w-4 text-gray-400" />
                                            Temperatura corrigida
                                        </p>
                                        <p className="font-medium text-gray-900">{selectedRecord?.correctedTemperature ?? "-"}</p>
                                    </div>
                                    <div>
                                        <p className="flex items-center gap-1.5 text-gray-500">
                                            <CheckCircle2Icon className="h-4 w-4 text-gray-400" />
                                            Corrigido
                                        </p>
                                        <p className="font-medium text-gray-900">
                                            {selectedRecord?.resolved == null ? "-" : selectedRecord.resolved ? "Sim" : "Não"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="flex items-center gap-1.5 text-gray-500">
                                            <Clock3Icon className="h-4 w-4 text-gray-400" />
                                            Corrigido em
                                        </p>
                                        <p className="font-medium text-gray-900">{selectedRecord?.resolvedAt || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="flex items-center gap-1.5 text-gray-500">
                                            <UserCheck2Icon className="h-4 w-4 text-gray-400" />
                                            Corrigido por
                                        </p>
                                        <p className="font-medium text-gray-900">{selectedRecord?.resolvedBy || "-"}</p>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <p className="flex items-center gap-1.5 text-gray-500">
                                            <WrenchIcon className="h-4 w-4 text-gray-400" />
                                            Ação corretiva
                                        </p>
                                        <p className="font-medium text-gray-900">
                                            {selectedRecord?.correctiveAction || "-"}
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
                                        {selectedRecordToCorrectiveAction?.food || "-"}
                                    </p>
                                </div>
                                <span
                                    className={
                                        selectedRecordToCorrectiveAction?.status === "CRITICAL"
                                            ? "rounded-full bg-red-500/10 px-3 py-1 text-sm font-medium text-red-600"
                                            : selectedRecordToCorrectiveAction?.status === "ALERT"
                                            ? "rounded-full bg-yellow-500/10 px-3 py-1 text-sm font-medium text-yellow-600"
                                            : "rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-600"
                                    }
                                >
                                    <AlertTriangleIcon className="mr-1 inline h-3.5 w-3.5" />
                                    {selectedRecordToCorrectiveAction?.statusLabel || "-"}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm text-gray-700 sm:grid-cols-3">
                                <div>
                                    <p className="flex items-center gap-1.5 text-gray-500">
                                        <ThermometerIcon className="h-4 w-4 text-gray-400" />
                                        Temperatura
                                    </p>
                                    <p className="font-medium text-gray-900">
                                        {selectedRecordToCorrectiveAction?.temperature || "-"}
                                    </p>
                                </div>
                                <div>
                                    <p className="flex items-center gap-1.5 text-gray-500">
                                        <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                                        Data
                                    </p>
                                    <p className="font-medium text-gray-900">
                                        {selectedRecordToCorrectiveAction?.createdAt || "-"}
                                    </p>
                                </div>
                                <div>
                                    <p className="flex items-center gap-1.5 text-gray-500">
                                        <GaugeIcon className="h-4 w-4 text-gray-400" />
                                        Temperatura Recomendada
                                    </p>
                                    <p className="font-medium text-gray-900">
                                        {selectedRecordToCorrectiveAction?.defaultInterval || "-"}
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