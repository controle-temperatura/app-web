"use client"

import { useEffect, useState, useCallback } from "react";
import Filters, { FilterValues } from "./filters";
import { api } from "@/lib/api";
import { EyeIcon, WrenchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, Pagination, Column, PaginationInfo } from "@/components/shared/data-table";

interface RecordData {
    id: string | number;
    food: string;
    sector: string;
    temperature: string;
    status: string;
    createdAt: string;
    user: string;
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
            accessor: "status",
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
                    <Button variant="ghost" size="icon" className="w-6 h-6 hover:bg-transparent hover:cursor-pointer">
                        <EyeIcon className="w-6 h-6" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-6 h-6 hover:bg-transparent hover:cursor-pointer">
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
        </div>
    )
}