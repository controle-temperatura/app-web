"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { AlertTriangleIcon, CalendarCheckIcon, CalendarIcon, CalendarRangeIcon, CheckCircleIcon, DownloadIcon, Loader2Icon, SettingsIcon, ShieldCheckIcon, ThermometerIcon, TrendingUpIcon } from "lucide-react";
import ReportsCard from "./card";
import ShowCard from "./showcard";
import { Column, DataTable, Pagination, PaginationInfo } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";

export default function ReportsPage() {
    const [data, setData] = useState<any>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 10,
        totalRecords: 0,
        totalPages: 0,
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const response: any = await api.get("/dashboard/reports?tablePage=1&tableLimit=10");
            setData(response);
            setPagination(response.pagination);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const fetchTablePage = async (page: number) => {
        setLoading(true);
        try {
            const response: any = await api.get(`/reports/updateTablePage?page=${page}&limit=10`);
            setData({ ...data, response });
            setPagination(response.pagination);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, [])

    useEffect(() => {
        console.log(data)
    }, [data])

    const handlePageChange = (page: number) => {
        fetchTablePage(page);
    }
    
    const reportTypesIcons = {
        "DAILY": <CalendarCheckIcon className="w-4 h-4" />,
        "WEEKLY": <CalendarRangeIcon className="w-4 h-4" />,
        "MONTHLY": <CalendarIcon className="w-4 h-4" />,
        "CONFORMITY": <ShieldCheckIcon className="w-4 h-4" />,
        "CUSTOM": <SettingsIcon className="w-4 h-4" />
    }

    const reportsDataIcons = {
        "conformityRate": <TrendingUpIcon className="w-4 h-4" />,
        "totalRecords": <ThermometerIcon className="w-4 h-4" />,
        "totalCriticalAlerts": <AlertTriangleIcon className="w-4 h-4" />,
        "totalCorrectiveActions": <CheckCircleIcon className="w-4 h-4" />
    }

    const reportsDataColors = {
        "conformityRate": "green-500",
        "totalRecords": "blue-500",
        "totalCriticalAlerts": "destructive",
        "totalCorrectiveActions": "yellow-500"
    }


    const columns: Column<any>[] = [
        {
            header: "Data",
            accessor: "createdAt"
        },
        {
            header: "Tipo",
            accessor: "type"
        },
        {
            header: "Intervalo",
            accessor: "period"
        },
        {
            header: "Usuário",
            accessor: "user"
        },
        {
            header: "Ação",
            cell: (record) => (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="w-6 h-6 hover:bg-transparent hover:cursor-pointer">
                        <DownloadIcon className="w-6 h-6" />
                        <span className="text-sm">Dowload</span>
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="flex flex-col gap-6">
            {loading ? (
                <div className="flex items-center justify-center">
                    <Loader2Icon className="w-4 h-4 animate-spin" />
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {
                            data?.reportTypes?.map((reportType: any) => (
                                <ReportsCard
                                    key={reportType.id}
                                    title={reportType.label}
                                    description={reportType.description}
                                    value={reportType.id}
                                    icon={reportTypesIcons[reportType.id as keyof typeof reportTypesIcons]}
                                />  
                            ))
                        }
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {
                            data?.recordsData?.map((record: any) => (
                                <ShowCard
                                    key={record.type}
                                    text={record.title}
                                    value={record.value}
                                    icon={reportsDataIcons[record.type as keyof typeof reportsDataIcons]}
                                    color={reportsDataColors[record.type as keyof typeof reportsDataColors]}
                                />
                            ))
                        }
                    </div>
                    <div className="flex flex-col gap-4">
                        <h2 className="text-2xl font-bold">Histórico</h2>
                        <DataTable 
                            columns={columns}
                            data={data?.reports}
                            isLoading={loading}
                            getRowKey={(record) => record.id}
                        />
                        <Pagination 
                            pagination={pagination}
                            onPageChange={handlePageChange}
                            disabled={loading}
                            recordsCount={data?.reports?.length}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}