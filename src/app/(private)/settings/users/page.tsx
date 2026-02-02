"use client"

import { api } from "@/lib/api"
import { useCallback, useEffect, useState } from "react"
import { FilterValues } from "./filters"
import Topbar from "./topbar"
import { Column, DataTable, PaginationInfo, Pagination } from "@/components/shared/data-table"
import { Button } from "@/components/ui/button"
import { PencilIcon, TrashIcon } from "lucide-react"
import SimpleCard from "@/components/shared/simple-card/simple-card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

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

    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [createForm, setCreateForm] = useState<any>({
        id: "",
        name: "",
        email: "",
        role: "COLABORATOR",
        active: true,
        passwordType: "LINK",
    })

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
        setCreateForm({
            id: "",
            name: "",
            email: "",
            role: "COLABORATOR",
        })
    }

    const handleCreateUser = async () => {
        try {
            const response: any = await api.post("/users", createForm);
            console.log(response)
        } catch (error) {
            console.error(error)
        }

        handleCloseCreateModal()
    }

    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [editForm, setEditForm] = useState<any>({
        id: "",
        name: "",
        email: "",
        role: "COLABORATOR",
        active: true,
    })

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [deletingItem, setDeletingItem] = useState<any>(null);

    const handleOpenCreateModal = () => {
        setIsCreateModalOpen(true);
        setCreateForm({
            id: "",
            name: "",
            email: "",
            role: "COLABORATOR",
            active: true,
            passwordType: "LINK",
        })
    }

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
            <Topbar onFilterChange={handleFilterChange} handleOpenCreateModal={handleOpenCreateModal} />
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

            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Novo usuário</DialogTitle>
                        <DialogDescription>Adicione um novo usuário ao sistema e defina suas permissões.</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <Label>Nome</Label>
                            <Input
                                type="text"
                                placeholder="Nome"
                                value={createForm.name}
                                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>Email</Label>
                            <Input
                                type="email"
                                placeholder="Email"
                                value={createForm.email}
                                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>Cargo</Label>
                            <Select
                                value={createForm.role}
                                onValueChange={(value) => setCreateForm({ ...createForm, role: value as "COLABORATOR" | "ADMIN" | "AUDITOR" })}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione um cargo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="COLABORATOR">Colaborador</SelectItem>
                                    <SelectItem value="ADMIN">Administrador</SelectItem>
                                    <SelectItem value="AUDITOR">Auditor</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>Senha</Label>
                            <RadioGroup value={createForm.passwordType} onValueChange={(value) => setCreateForm({ ...createForm, passwordType: value as "LINK" | "MANUAL" })}>
                                <div className="flex flex-row gap-2">
                                    <RadioGroupItem value="LINK" selected={createForm.passwordType === "LINK"}></RadioGroupItem>
                                    <p>Gerar senha automática e enviar por e-mail</p>
                                </div>
                                <div className="flex flex-row gap-2">
                                    <RadioGroupItem value="MANUAL" selected={createForm.passwordType === "MANUAL"}></RadioGroupItem>
                                    <p>Definir senha manualmente</p>
                                </div>
                            </RadioGroup>
                        </div>
                        {
                            createForm.passwordType === "MANUAL" && (
                                <div className="flex flex-col gap-2">
                                    <Label>Senha</Label>
                                    <Input
                                        type="password"
                                        placeholder="Senha"
                                        value={createForm.password}
                                    />
                                </div>
                            )
                        }
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancelar</Button>
                        <Button variant="default" onClick={() => handleCreateUser()}>Criar usuário</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}