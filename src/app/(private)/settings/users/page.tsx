"use client"

import { api } from "@/lib/api"
import { useCallback, useEffect, useState } from "react"
import { FilterValues } from "./filters"
import Topbar from "./topbar"
import { Column, DataTable, PaginationInfo, Pagination } from "@/components/shared/data-table"
import { Button } from "@/components/ui/button"
import { PencilIcon, TrashIcon } from "lucide-react"
import SimpleCard from "@/components/shared/simple-card/simple-card"

interface RecordData {
    id: string;
    name: string;
    email: string,
    role: string;
    active: boolean;
}

export default function UsersPage() {
    const [users, setUsers] = useState<any>()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 10,
        totalRecords: 0,
        totalPages: 0,
    })

    const [filters, setFilters] = useState<FilterValues>({
        role: "",
        active: null,
        search: "",
    })

    const fetchData = useCallback(async (page: number = 1, filterValues: FilterValues) => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: pagination.limit.toString(),
            });
            
            if (filterValues.role) params.append('role', filterValues.role);
            if (filterValues.active !== null) params.append('active', filterValues.active.toString());
            if (filterValues.search) params.append('search', filterValues.search);

            const response: any = await api.get(`/users?${params.toString()}`);

            console.log(response)

            setPagination(response.pagination);
            setUsers(response)
        } catch (error) {
            setError(error as string)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData(pagination.page, filters)
    }, [])

    const handleFilterChange = (filters: FilterValues) => {
        setFilters(filters)
    }   

    useEffect(() => {
        fetchData(1, filters)
    }, [filters, fetchData])

    const handlePageChange = useCallback((newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchData(newPage, filters)
        }
    }, [pagination.totalPages, filters, fetchData])

    const columns: Column<RecordData>[] = [
        {
            header: 'Nome',
            accessor: 'name',
        },
        {
            header: 'Email',
            accessor: 'email',
        },
        {
            header: 'Cargo',
            accessor: 'role',
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
            cell: (record) => (
                <div className="flex flex-row gap-2">
                    <Button variant="ghost" size="icon">
                        <PencilIcon className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <TrashIcon className="w-4 h-4" />
                    </Button>
                </div>
            ),
        },
    ]

    return (
        <div className="flex flex-col gap-6">
            <Topbar onFilterChange={handleFilterChange} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-2/3 mx-auto gap-4">
                <SimpleCard value={users?.totalCount} text="Total de usuários" />
                <SimpleCard value={users?.totalColaborators} text="Colaboradores" />
                <SimpleCard value={users?.totalAdmins} text="Administradores" />
                <SimpleCard value={users?.totalAuditors} text="Auditores" />
            </div>
            <div className="flex flex-col gap-2">
                <DataTable
                    columns={columns}
                    data={users?.users}
                    isLoading={loading}
                    getRowKey={(row) => row.id}
                />
                <Pagination
                    pagination={pagination}
                    disabled={loading}
                    onPageChange={handlePageChange}
                    recordsCount={pagination.totalRecords}
                />
            </div>
        </div>
    )
}