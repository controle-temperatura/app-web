"use client"

import { useCallback, useEffect, useMemo, useState } from "react";
import { FilterValues } from "./filters";
import { Column, DataTable, Pagination, PaginationInfo } from "@/components/shared/data-table";
import { api } from "@/lib/api";
import { LucideIcon, PencilIcon, PlusIcon, TrashIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Button } from "@/components/ui/button";
import Topbar from "./topbar";
import SimpleCard from "@/components/shared/simple-card/simple-card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RecordData {
    id: string;
    name: string;
    icon?: string;
    responsibleUser: string;
    measurementTimes: string[] | string;
    foodsCount: number;
    active: boolean;
}

export default function SectorsPage() {
    const [sectors, setSectors] = useState<any>([]);
    const [sectorsLoading, setSectorsLoading] = useState<boolean>(false);
    const [admins, setAdmins] = useState<any>([]);
    const [adminsLoading, setAdminsLoading] = useState<boolean>(false);

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

    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [createForm, setCreateForm] = useState<any>({
        name: "",
        icon: "",
        description: "",
        responsibleUserId: "",
        measurementTimes: [],
    })

    const handleOpenCreateModal = () => {
        setIsCreateModalOpen(true);
        setCreateForm({
            name: "",
            icon: "",
            description: "",
            responsibleUserId: "",
            measurementTimes: [],
        })
    }

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
        setCreateForm({
            name: "",
            icon: "",
            description: "",
            responsibleUserId: "",
            measurementTimes: [],
        })
    }

    const handleAddMeasurementTime = () => {
        setCreateForm({ ...createForm, measurementTimes: [...createForm.measurementTimes, "00:00"] });
    }
    const handleRemoveMeasurementTime = (index: number) => {
        setCreateForm({ ...createForm, measurementTimes: createForm.measurementTimes.filter((_: any, i: number) => i !== index) });
    }

    const handleChangeMeasurementTime = (value: string, index: number) => {
        setCreateForm({ ...createForm, measurementTimes: createForm.measurementTimes.map((time: string, i: number) => i === index ? value : time) });
    }

    const handleCreateSector = async () => {
        console.log(createForm);
        try {
            await api.post("/sectors", createForm);
            fetchSectors(1, filters);
        } catch (error) {
            console.error('Error creating sector:', error)
        }

        handleCloseCreateModal()
    }

    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [editForm, setEditForm] = useState<any>({
        id: "",
        name: "",
        icon: "",
        description: "",
        responsibleUserId: "",
        measurementTimes: [],
        active: null,
    })

    const [iconQuery, setIconQuery] = useState<string>("");
    const [isIconListOpen, setIsIconListOpen] = useState<boolean>(false);
    const [editIconQuery, setEditIconQuery] = useState<string>("");
    const [isEditIconListOpen, setIsEditIconListOpen] = useState<boolean>(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [deletingItem, setDeletingItem] = useState<any>(null);

    const iconOptions = useMemo(() => {
        return Object.entries(LucideIcons).flatMap(([name, Icon]) => {
            if (name === "LucideIcon" || name === "Icon" || name === "createLucideIcon") return [];
            if (name[0] !== name[0].toUpperCase()) return [];
            if (typeof Icon !== "function" && typeof Icon !== "object") return [];
            if (name.startsWith("Lucide") || !name.endsWith("Icon")) return [];
            return [{ name, Icon: Icon as unknown as LucideIcon }];
        });
    }, []);

    const iconMap = useMemo(() => {
        return new Map(iconOptions.map((item) => [item.name, item.Icon]));
    }, [iconOptions]);

    const filteredIcons = useMemo(() => {
        const query = iconQuery.trim().toLowerCase();
        if (!query) return iconOptions.slice(0, 40);
        return iconOptions.filter((item) => item.name.toLowerCase().includes(query)).slice(0, 40);
    }, [iconOptions, iconQuery]);

    const filteredEditIcons = useMemo(() => {
        const query = editIconQuery.trim().toLowerCase();
        if (!query) return iconOptions.slice(0, 40);
        return iconOptions.filter((item) => item.name.toLowerCase().includes(query)).slice(0, 40);
    }, [iconOptions, editIconQuery]);

    const handleAddEditMeasurementTime = () => {
        setEditForm({ ...editForm, measurementTimes: [...editForm.measurementTimes, "00:00"] });
    }
    const handleRemoveEditMeasurementTime = (index: number) => {
        setEditForm({ ...editForm, measurementTimes: editForm.measurementTimes.filter((_: any, i: number) => i !== index) });
    }

    const handleChangeEditMeasurementTime = (value: string, index: number) => {
        setEditForm({ ...editForm, measurementTimes: editForm.measurementTimes.map((time: string, i: number) => i === index ? value : time) });
    }

    const handleOpenEditModal = async (record: RecordData) => {
        try {
            const response: any = await api.get(`/sectors/${record.id}`);
            setEditForm({
                id: response?.id ?? record.id,
                name: response?.name ?? record.name,
                icon: response?.icon ?? "",
                description: response?.description ?? "",
                responsibleUserId: response?.responsibleUserId ?? "",
                measurementTimes: response?.measurementTimes ?? [],
                active: response?.active ?? record.active ?? true,
            });
            setEditIconQuery(response?.icon ?? "");
        } catch (error) {
            console.error("Error fetching sector:", error);
            setEditForm({
                id: record.id,
                name: record.name,
                icon: "",
                description: "",
                responsibleUserId: "",
                measurementTimes: [],
                active: record.active ?? true,
            });
            setEditIconQuery("");
        } finally {
            setIsEditModalOpen(true);
        }
    }

    const handleCancelEdit = () => {
        setIsEditModalOpen(false);
        setEditForm({
            id: "",
            name: "",
            icon: "",
            description: "",
            responsibleUserId: "",
            measurementTimes: [],
            active: null,
        });
        setEditIconQuery("");
    }

    const handleConfirmEdit = async () => {
        if (!editForm.id) return;
        try {
            await api.patch(`/sectors/${editForm.id}`, {
                name: editForm.name,
                icon: editForm.icon,
                description: editForm.description,
                responsibleUserId: editForm.responsibleUserId,
                measurementTimes: editForm.measurementTimes,
                active: editForm.active,
            });
            fetchSectors(1, filters);
        } catch (error) {
            console.error("Error updating sector:", error);
        } finally {
            handleCancelEdit();
        }
    }

    const handleOpenDeleteModal = (record: RecordData) => {
        setDeletingItem(record);
        setIsDeleteModalOpen(true);
    }

    const handleCloseDeleteModal = () => {
        setDeletingItem(null);
        setIsDeleteModalOpen(false);
    }

    const handleConfirmDelete = async (sectorId?: string) => {
        if (!sectorId) return;
        try {
            await api.delete(`/sectors/${sectorId}`);
            fetchSectors(1, filters);
        } catch (error) {
            console.error("Error deleting sector:", error);
        } finally {
            handleCloseDeleteModal();
        }
    }

    const fetchAdmins = useCallback(async () => {
        setAdminsLoading(true);
        try {
            const response: any = await api.get("/users/admins");
            setAdmins(response);

        } catch (error) {
            console.error('Error fetching admins:', error)
        } finally {
            setAdminsLoading(false);
        }
    }, [])

    useEffect(() => {
        fetchAdmins();
    }, []);

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
            cell: (record: RecordData) => {
                const SelectedIcon = record.icon ? iconMap.get(record.icon) : undefined;
                console.log(record.icon)
                return (
                    <span className="flex items-center gap-2">
                        {SelectedIcon && <SelectedIcon className="h-4 w-4" />}
                        <span>{record.name}</span>
                    </span>
                )
            },
        },
        {
            header: 'Responsável',
            accessor: 'responsibleUser',
        },
        {
            header: 'Horários',
            cell: (record: RecordData) => {
                const times = Array.isArray(record.measurementTimes)
                    ? record.measurementTimes.join(', ')
                    : record.measurementTimes;
                return (
                    <span className="flex flex-row gap-2">
                        {times || '-'}
                    </span>
                )
            }
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
                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6 hover:bg-transparent hover:cursor-pointer"
                        onClick={() => handleOpenEditModal(record)}
                    >
                        <PencilIcon className="w-6 h-6" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6 hover:bg-transparent hover:cursor-pointer"
                        onClick={() => handleOpenDeleteModal(record)}
                    >
                        <TrashIcon className="w-6 h-6" />
                    </Button>
                </div>
            ),
        }
    ]

    return (
        <div className="flex flex-col gap-4">
            <Topbar onFilterChange={setFilters} handleOpenCreateModal={handleOpenCreateModal} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full md:w-2/3 mx-auto mt-4">
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
            <Dialog
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Novo setor</DialogTitle>
                        <DialogDescription>Cadastre um setor da cozinha para organizar alimentos e medições.</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-row gap-2">
                        <div className="flex flex-col gap-2 w-2/3">
                            <Label>Nome</Label> 
                            <Input type="text" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} />
                        </div>
                        <div className="flex flex-col gap-2 w-1/3">
                            <Label>Ícone</Label>
                            <div className="relative">
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="text"
                                        placeholder="Pesquisar ícone"
                                        value={iconQuery}
                                        onFocus={() => setIsIconListOpen(true)}
                                        onBlur={() => setTimeout(() => setIsIconListOpen(false), 100)}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setIconQuery(value);
                                            setCreateForm({ ...createForm, icon: value });
                                        }}
                                    />
                                    {createForm.icon && iconMap.get(createForm.icon) && (
                                        <span className="rounded-md border border-input p-2">
                                            {(() => {
                                                const SelectedIcon = iconMap.get(createForm.icon);
                                                if (!SelectedIcon) return null;
                                                return <SelectedIcon className="h-4 w-4" />;
                                            })()}
                                        </span>
                                    )}
                                </div>
                                {isIconListOpen && (
                                    <div className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-md border border-input bg-background shadow-md">
                                        {filteredIcons.length === 0 && (
                                            <div className="px-3 py-2 text-sm text-muted-foreground">
                                                Nenhum ícone encontrado
                                            </div>
                                        )}
                                        {filteredIcons.map((item) => (
                                            <button
                                                key={item.name}
                                                type="button"
                                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                                                onMouseDown={(event) => event.preventDefault()}
                                                onClick={() => {
                                                    setIconQuery(item.name);
                                                    setCreateForm({ ...createForm, icon: item.name });
                                                    setIsIconListOpen(false);
                                                }}
                                            >
                                                <item.Icon className="h-4 w-4" />
                                                <span>{item.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label>Descrição</Label>
                        <textarea className="w-full h-24 resize-none border border-input rounded-md p-2" value={createForm.description} onChange={(e: any) => setCreateForm({ ...createForm, description: e.target.value })} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label>Responsável</Label>
                        <Select value={createForm.responsibleUserId} onValueChange={(value: string) => setCreateForm({ ...createForm, responsibleUserId: value })}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione um responsável" />
                            </SelectTrigger>
                            <SelectContent>
                                {admins.map((admin: any) => (
                                    <SelectItem key={admin.id} value={admin.id}>{admin.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-row gap-2">
                            <Label>Horários de Registro</Label>
                            <Button variant="outline" size="icon" className="hover:cursor-pointer" onClick={handleAddMeasurementTime}>
                                <PlusIcon className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="flex flex-row gap-2">
                            {createForm.measurementTimes.map((time: string, index: number) => (
                                <div key={index} className="flex flex-row gap-2">
                                    <Input type="time" value={time} onChange={(e: any) => handleChangeMeasurementTime(e.target.value, index)} />
                                    <Button variant="outline" size="icon" className="hover:cursor-pointer" onClick={() => handleRemoveMeasurementTime(index)}>
                                        <TrashIcon className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => handleCloseCreateModal()}>Cancelar</Button>
                        <Button variant="default" onClick={() => handleCreateSector()}>Criar setor</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar setor</DialogTitle>
                        <DialogDescription>Atualize os dados do setor e suas configurações.</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-row gap-2">
                            <div className="flex flex-col gap-2 w-2/3">
                                <Label>Nome</Label>
                                <Input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                            </div>
                            <div className="flex flex-col gap-2 w-1/3">
                                <Label>Ícone</Label>
                                <div className="relative">
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="text"
                                            placeholder="Pesquisar ícone"
                                            value={editIconQuery}
                                            onFocus={() => setIsEditIconListOpen(true)}
                                            onBlur={() => setTimeout(() => setIsEditIconListOpen(false), 100)}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setEditIconQuery(value);
                                                setEditForm({ ...editForm, icon: value });
                                            }}
                                        />
                                        {editForm.icon && iconMap.get(editForm.icon) && (
                                            <span className="rounded-md border border-input p-2">
                                                {(() => {
                                                    const SelectedIcon = iconMap.get(editForm.icon);
                                                    if (!SelectedIcon) return null;
                                                    return <SelectedIcon className="h-4 w-4" />;
                                                })()}
                                            </span>
                                        )}
                                    </div>
                                    {isEditIconListOpen && (
                                        <div className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-md border border-input bg-background shadow-md">
                                            {filteredEditIcons.length === 0 && (
                                                <div className="px-3 py-2 text-sm text-muted-foreground">
                                                    Nenhum ícone encontrado
                                                </div>
                                            )}
                                            {filteredEditIcons.map((item) => (
                                                <button
                                                    key={item.name}
                                                    type="button"
                                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                                                    onMouseDown={(event) => event.preventDefault()}
                                                    onClick={() => {
                                                        setEditIconQuery(item.name);
                                                        setEditForm({ ...editForm, icon: item.name });
                                                        setIsEditIconListOpen(false);
                                                    }}
                                                >
                                                    <item.Icon className="h-4 w-4" />
                                                    <span>{item.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>Descrição</Label>
                            <textarea className="w-full h-24 resize-none border border-input rounded-md p-2" value={editForm.description} onChange={(e: any) => setEditForm({ ...editForm, description: e.target.value })} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>Responsável</Label>
                            <Select value={editForm.responsibleUserId} onValueChange={(value: string) => setEditForm({ ...editForm, responsibleUserId: value })}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione um responsável" />
                                </SelectTrigger>
                                <SelectContent>
                                    {admins.map((admin: any) => (
                                        <SelectItem key={admin.id} value={admin.id}>{admin.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row gap-2">
                                <Label>Horários de Registro</Label>
                                <Button variant="outline" size="icon" className="hover:cursor-pointer" onClick={handleAddEditMeasurementTime}>
                                    <PlusIcon className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="flex flex-row gap-2 flex-wrap">
                                {editForm.measurementTimes.map((time: string, index: number) => (
                                    <div key={index} className="flex flex-row gap-2">
                                        <Input type="time" value={time} onChange={(e: any) => handleChangeEditMeasurementTime(e.target.value, index)} />
                                        <Button variant="outline" size="icon" className="hover:cursor-pointer" onClick={() => handleRemoveEditMeasurementTime(index)}>
                                            <TrashIcon className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
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
                        <Button variant="outline" onClick={() => handleCancelEdit()}>Cancelar</Button>
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