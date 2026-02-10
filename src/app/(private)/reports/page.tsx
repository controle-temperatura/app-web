"use client";

import type { MouseEvent } from "react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { AlertTriangleIcon, CalendarCheckIcon, CalendarIcon, CalendarRangeIcon, CheckCircleIcon, DownloadIcon, Loader2Icon, SettingsIcon, ShieldCheckIcon, ThermometerIcon, TrendingUpIcon } from "lucide-react";
import ReportsCard from "./card";
import ShowCard from "./showcard";
import { Column, DataTable, Pagination, PaginationInfo } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function ReportsPage() {
    const today = new Date();
    const pad2 = (value: number) => String(value).padStart(2, "0");
    const isoDate = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`;
    const isoMonth = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}`;
    const getIsoWeek = (date: Date) => {
        const temp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNumber = temp.getUTCDay() || 7;
        temp.setUTCDate(temp.getUTCDate() + 4 - dayNumber);
        const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
        const week = Math.ceil((((temp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
        return `${temp.getUTCFullYear()}-W${pad2(week)}`;
    };
    const isoWeek = getIsoWeek(today);

    const [data, setData] = useState<any>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 10,
        totalRecords: 0,
        totalPages: 0,
    });

    const [isDownloading, setIsDownloading] = useState<boolean>(false);

    const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState<boolean>(false);
    const [downloadFormat, setDownloadFormat] = useState<string>("pdf");
    const [reportType, setReportType] = useState<string>("");
    const [reportPeriodType, setReportPeriodType] = useState<"day" | "week" | "month">("day");
    const [reportDay, setReportDay] = useState<string>(isoDate);
    const [reportWeek, setReportWeek] = useState<string>(isoWeek);
    const [reportMonth, setReportMonth] = useState<string>(isoMonth);

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
            setData({ ...data, reports: response.reports, pagination: response.pagination });
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

    const handlePageChange = (page: number, event?: MouseEvent<HTMLButtonElement>) => {
        event?.preventDefault();
        fetchTablePage(page);
    }

    const handleOpenDownloadDialog = () => {
        setIsDownloadDialogOpen(true);
    }

    const handleOpenDownloadDialogForType = (type: string) => {
        setReportType(type);
        if (type === "DAILY") setReportPeriodType("day");
        if (type === "WEEKLY") setReportPeriodType("week");
        if (type === "MONTHLY") setReportPeriodType("month");
        setIsDownloadDialogOpen(true);
    }

    const extractFilename = (contentDisposition: string, fallback: string) => {
        const utfMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
        if (utfMatch?.[1]) {
            return decodeURIComponent(utfMatch[1]);
        }

        const asciiMatch = contentDisposition.match(/filename="([^"]+)"/i);
        if (asciiMatch?.[1]) {
            return asciiMatch[1];
        }

        return fallback;
    };

    const triggerDownload = async (response: Response, fallbackFilename: string) => {
        const blob = await response.blob();
        const contentDisposition = response.headers.get("content-disposition") || "";
        const filename = extractFilename(contentDisposition, fallbackFilename);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    };

    const handleDownload = async () => {
        setIsDownloading(true);
        if (!reportType) return;

        const params = new URLSearchParams({
            format: downloadFormat,
        });

        if ((reportType === "DAILY" || reportType === "CONFORMITY") && reportDay) params.set("date", reportDay);
        if (reportType === "WEEKLY" && reportWeek) params.set("week", reportWeek);
        if (reportType === "MONTHLY" && reportMonth) params.set("month", reportMonth);

        try {
            console.log(`/reports/${reportType}?${params.toString()}`);
            const response = await api.download(`/reports/${reportType}?${params.toString()}`);
            const reportTypeNames: Record<string, string> = {
                DAILY: "diario",
                WEEKLY: "semanal",
                MONTHLY: "mensal",
                CONFORMITY: "conformidade",
                CUSTOM: "personalizado",
            };
            const fallbackFilename = `relatorio-${reportTypeNames[reportType] ?? reportType.toLowerCase()}-${Date.now()}.${downloadFormat}`;
            await triggerDownload(response, fallbackFilename);
            setIsDownloadDialogOpen(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsDownloading(false);
        }
    }

    const handleDownloadSavedReport = async (report: any) => {
        if (!report?.id) return;

        try {
            const response = await api.download(`/reports/saved/${report.id}`);
            const fallbackFilename = report?.fileUrl?.split("/").pop() || `relatorio-${report.id}`;
            await triggerDownload(response, fallbackFilename);
        } catch (error) {
            console.error(error);
        }
    };

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
            header: "Formato",
            accessor: "format"
        },
        {
            header: "Usuário",
            accessor: "user"
        },
        {
            header: "Ação",
            cell: (record) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6 hover:bg-transparent hover:cursor-pointer"
                        onClick={() => handleDownloadSavedReport(record)}
                    >
                        <DownloadIcon className="w-6 h-6" />
                        <span className="text-sm">Download</span>
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
                            data?.reportTypes
                                ?.map((reportType: any) => (
                                    <ReportsCard
                                        key={reportType.id}
                                        title={reportType.label}
                                        description={reportType.description}
                                        value={reportType.id}
                                        icon={reportTypesIcons[reportType.id as keyof typeof reportTypesIcons]}
                                        onClick={() => handleOpenDownloadDialogForType(reportType.id)}
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
            <Dialog
                open={isDownloadDialogOpen}
                onOpenChange={setIsDownloadDialogOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Download</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <div className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-700">Período do relatório</p>
                            </div>
                            <div className="grid gap-2">
                                {reportPeriodType === "day" && (
                                    <>
                                        <label className="text-sm text-gray-500">Selecione o dia</label>
                                        <Input
                                            type="date"
                                            value={reportDay}
                                            onChange={(event) => setReportDay(event.target.value)}
                                        />
                                    </>
                                )}
                                {reportPeriodType === "week" && (
                                    <>
                                        <label className="text-sm text-gray-500">Selecione a semana</label>
                                        <Input
                                            type="week"
                                            value={reportWeek}
                                            onChange={(event) => setReportWeek(event.target.value)}
                                        />
                                        <p className="text-xs text-gray-500">
                                            O calendário seleciona automaticamente toda a semana.
                                        </p>
                                    </>
                                )}
                                {reportPeriodType === "month" && (
                                    <>
                                        <label className="text-sm text-gray-500">Selecione o mês</label>
                                        <Input
                                            type="month"
                                            value={reportMonth}
                                            onChange={(event) => setReportMonth(event.target.value)}
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogDescription>
                        <p>Selecione o formato de download</p>
                    </DialogDescription>
                    <div className="flex flex-row gap-4">
                        <Button variant={downloadFormat === "pdf" ? "default" : "outline"} onClick={() => setDownloadFormat("pdf")}>PDF</Button>
                        <Button variant={downloadFormat === "xlsx" ? "default" : "outline"} onClick={() => setDownloadFormat("xlsx")}>Excel</Button>
                        <Button variant={downloadFormat === "csv" ? "default" : "outline"} onClick={() => setDownloadFormat("csv")}>CSV</Button>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDownloadDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleDownload} disabled={isDownloading}>{isDownloading ? "Gerando Relatório..." : "Download"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}