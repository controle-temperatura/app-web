"use client"

import { useCallback, useEffect, useState } from "react";
import Topbar from "./topbar";
import { FilterValues } from "./filters";
import { api } from "@/lib/api";
import SimpleCard from "@/components/shared/simple-card/simple-card";
import { Button } from "@/components/ui/button";
import { PencilIcon, TrashIcon } from "lucide-react";
import { DataTable, Pagination, Column, PaginationInfo } from "@/components/shared/data-table";

interface RecordData {
    id: string;
    name: string;
    sector: string;
    tempMin: number;
    tempMax: number;
    active: boolean;
}

export default function FoodsPage() {
    const [foods, setFoods] = useState<any>([]);
    const [foodsLoading, setFoodsLoading] = useState<boolean>(false);
    const [foodsData, setFoodsData] = useState<RecordData[]>([]);

    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 10,
        totalRecords: 0,
        totalPages: 0,
    });

    const [filters, setFilters] = useState<FilterValues>({
        sectorId: "",
        active: null,
        search: "",
    });

    const fetchFoods = useCallback(async (page: number = 1, filterValues: FilterValues) => {
        setFoodsLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: pagination.limit.toString(),
            });

            if (filterValues.sectorId) params.append('sectorId', filterValues.sectorId);
            if (filterValues.active !== null) params.append('active', filterValues.active.toString());
            if (filterValues.search) params.append('search', filterValues.search);

            const response: any = await api.get(`/foods?${params.toString()}`);

            setPagination(response.pagination);
            setFoodsData(response.foods);
            setFoods(response);
        } catch (error) {
            console.error("Error fetching foods:", error);
        } finally {
            setFoodsLoading(false);
        }
    }, [pagination.limit]);


    useEffect(() => {
        fetchFoods(1, filters);
    }, []);

    useEffect(() => {
        fetchFoods(1, filters);
    }, [filters, fetchFoods]);

    const handlePageChange = useCallback((newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchFoods(newPage, filters);
        }
    }, [pagination.totalPages, filters, fetchFoods]);

    const columns: Column<RecordData>[] = [
        {
            header: 'Alimento',
            accessor: 'name',
        },
        {
            header: 'Setor',
            accessor: 'sector',
        },
        {
            header: 'Temperatura Mínima',
            accessor: 'tempMin',
        },
        {
            header: 'Temperatura Máxima',
            accessor: 'tempMax',
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
                <SimpleCard value={foods.totalCount} text="Total de Alimentos" />
                <SimpleCard value={foods.sectorsCount} text="Setores Cadastrados" />
                <SimpleCard value={foods.activeCount} text="Alimentos Ativos" />
            </div>
            <div className="flex flex-col gap-2">
                <DataTable 
                    columns={columns} 
                    data={foodsData}
                    isLoading={foodsLoading}
                    getRowKey={(row) => row.id}
                />
                <Pagination 
                    pagination={pagination} 
                    disabled={foodsLoading}
                    onPageChange={handlePageChange}
                    recordsCount={foods.totalCount}
                />
            </div>
        </div>
    )
}