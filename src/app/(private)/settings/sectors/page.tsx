"use client"

import { useCallback, useEffect, useState } from "react";
import { FilterValues } from "./filters";
import { Column, DataTable, Pagination, PaginationInfo } from "@/components/shared/data-table";
import { api } from "@/lib/api";
import { PencilIcon, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Topbar from "./topbar";
import SimpleCard from "@/components/shared/simple-card/simple-card";

interface RecordData {
    id: string;
    name: string;
    responsibleUser: string;
    measurementTimes: string;
    foodsCount: number;
    active: boolean;
}

export default function SectorsPage() {
    const [sectors, setSectors] = useState<any>([]);
    const [sectorsLoading, setSectorsLoading] = useState<boolean>(false);

    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 10,
        totalRecords: 0,
        totalPages: 0,
    })

    const [filters, setFilters] = useState<FilterValues>({
        active: null,
        search: ""
    })

    const fetchSectors = useCallback(async (page: number = 1, filterValues: FilterValues) => {
        setSectorsLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: pagination.limit.toString(),
            });

            if (filterValues.active !== null) params.append('active', filterValues.active.toString());
            if (filterValues.search) params.append('search', filterValues.search);

            const response: any = await api.get(`/sectors?${params.toString()}`);

            setPagination(response.pagination);
            setSectors(response);
        } catch (error) {
            console.error('Error fetching sectors:', error)
        } finally {
            setSectorsLoading(false);
        }
        
    }, [])

    useEffect(() => {
        fetchSectors(1, filters);
    }, []);

    useEffect(() => {
        fetchSectors(1, filters);
    }, [filters, fetchSectors]);

    const handlePageChange = useCallback((newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchSectors(newPage, filters);
        }
    }, [pagination.totalPages, filters, fetchSectors]);

    const columns: Column<RecordData>[] = [
        {
            header: 'Nome',
            accessor: 'name',
        },
        {
            header: 'Responsável',
            accessor: 'responsibleUser',
        },
        {
            header: 'Horários',
            accessor: 'measurementTimes',
        },
        {
            header: 'Total de Alimentos',
            accessor: 'foodsCount',
        },
        {
            header: 'Status',
            cell: (record: RecordData) => (
                <span className={record.active ? 'text-green-500 bg-green-500/10 px-2 py-1 rounded-md' : 'text-red-500 bg-red-500/10 px-2 py-1 rounded-md'}>
                    {record.active ? 'Ativo' : 'Inativo'}
                </span>
            )
        },
        {
            header: 'Ações',
            cell: (record: any) => (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="w-6 h-6 hover:bg-transparent hover:cursor-pointer">
                        <PencilIcon className="w-6 h-6" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-6 h-6 hover:bg-transparent hover:cursor-pointer">
                        <TrashIcon className="w-6 h-6" />
                    </Button>
                </div>
            ),
        }
    ]

    return (
        <div className="flex flex-col gap-4">
            <Topbar onFilterChange={setFilters} />
            <div className="grid grid-cols-3 gap-4 w-2/3 mx-auto mt-4">
                <SimpleCard value={sectors?.totalCount} text="Total de Setores" />
                <SimpleCard value={sectors?.activeCount} text="Setores Ativos" />
                <SimpleCard value={sectors?.responsibleUsersCount} text="Responsáveis" />
            </div>
            <div className="flex flex-col gap-2">
                <DataTable 
                    columns={columns} 
                    data={sectors?.sectors} 
                    isLoading={sectorsLoading} 
                    getRowKey={(row) => row.id} 
                />
                <Pagination 
                    pagination={pagination} 
                    disabled={sectorsLoading} 
                    onPageChange={handlePageChange} 
                    recordsCount={sectors?.totalCount}
                />
            </div>
        </div>
    )
}