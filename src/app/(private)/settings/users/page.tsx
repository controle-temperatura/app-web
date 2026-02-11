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
import { toast } from "sonner"

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
    const [isSendingPasswordLink, setIsSendingPasswordLink] = useState<boolean>(false)

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
        name: "",
        email: "",
        password: undefined,
        role: "COLABORATOR",
        passwordType: "LINK",
    })

    const handleOpenCreateModal = () => {
        setIsCreateModalOpen(true);
        setCreateForm({
            name: "",
            email: "",
            password: undefined,
            role: "COLABORATOR",
            passwordType: "LINK",
        })
    }

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
        setCreateForm({
            name: "",
            email: "",
            password: undefined,
            role: "COLABORATOR",
            passwordType: "LINK",
        })
    }

    const handleCreateUser = async () => {
        setIsSendingPasswordLink(true)
        try {
            const response: any = await api.post("/users", createForm);
            fetchData(1, filters)
            setIsSendingPasswordLink(false)
        } catch (error) {
            setIsSendingPasswordLink(false)
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

    const handleOpenEditModal = async (user: any) => {
        
        const userData: any = await api.get(`/users/${user.id}`)

        setIsEditModalOpen(true);
        setEditForm({
            id: userData.id,
            name: user.name,
            email: userData.email,
            role: userData.role,
            active: userData.active,
        })
    }

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditForm({
            id: "",
            name: "",
            email: "",
            role: "",
            active: true,
        })
    }

    const handleConfirmEdit = async () => {
        if (!editForm.id) return

        try {
            await api.patch(`/users/${editForm.id}`, {
                name: editForm.name,
                email: editForm.email,
                role: editForm.role,
                active: editForm.active,
            })
            fetchData(1, filters)
        } catch (error) {
            console.error(error)
        }

        handleCloseEditModal()
    }
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [deletingItem, setDeletingItem] = useState<any>(null);

    const handleOpenDeleteModal = (user: any) => {
        setDeletingItem(user);
        setIsDeleteModalOpen(true);
    }

    const handleCloseDeleteModal = () => {
        setDeletingItem(null);
        setIsDeleteModalOpen(false);
    }

    const handleConfirmDelete = async (userId?: string) => {
        if (!userId) return;

        try {
            await api.delete(`/users/${userId}`);
            toast.success(`Usuário ${deletingItem?.name} deletado com sucesso`);
            fetchData(1, filters);
        } catch (error) {
            console.error(error);
        } finally {
            handleCloseDeleteModal();
        }
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
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(record)}>
                        <PencilIcon className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteModal(record)}>
                        <TrashIcon className="w-4 h-4" />
                    </Button>
                </div>
            ),
        },
    ]

    return (
        <div className="flex flex-col gap-6">
            <Topbar onFilterChange={handleFilterChange} handleOpenCreateModal={handleOpenCreateModal} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full md:w-2/3 mx-auto gap-4">
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
                                        onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                                    />
                                </div>
                            )
                        }
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancelar</Button>
                        <Button variant="default" disabled={isSendingPasswordLink} onClick={() => handleCreateUser()}>{isSendingPasswordLink ? "Enviando link..." : "Criar usuário"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar usuário</DialogTitle>
                        <DialogDescription>Edite as informações do usuário e defina suas permissões.</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <Label>Nome</Label>
                            <Input
                                type="text"
                                placeholder="Nome"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>Email</Label>
                            <Input
                                type="email"
                                placeholder="Email"
                                value={editForm.email}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>Cargo</Label>
                            <Select
                                value={editForm.role}
                                onValueChange={(value) => setEditForm({ ...editForm, role: value as "COLABORATOR" | "ADMIN" | "AUDITOR" })}
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
                            <Label>Status</Label>
                            <div className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2">
                                <span className={`text-sm text-gray-700 ${editForm.active ? "text-green-500" : "text-red-500"}`}>
                                    {editForm.active ? "Ativo" : "Inativo"}
                                </span>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={editForm.active}
                                    onClick={() => setEditForm({ ...editForm, active: !editForm.active })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        editForm.active ? "bg-primary" : "bg-gray-300"
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                                            editForm.active ? "translate-x-5" : "translate-x-1"
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => handleCloseEditModal()}>Cancelar</Button>
                        <Button variant="default" onClick={() => handleConfirmEdit()}>Salvar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Deletar {deletingItem?.name}?</DialogTitle>
                        <DialogDescription>Esta ação não poderá ser desfeita.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => handleCloseDeleteModal()}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" className="hover:bg-destructive/90" onClick={() => handleConfirmDelete(deletingItem?.id)}>
                            Deletar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}