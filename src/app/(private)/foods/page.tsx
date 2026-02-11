"use client"

import { useCallback, useEffect, useState } from "react";
import Topbar from "./topbar";
import { FilterValues } from "./filters";
import { api } from "@/lib/api";
import SimpleCard from "@/components/shared/simple-card/simple-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PencilIcon, TrashIcon } from "lucide-react";
import { DataTable, Pagination, Column, PaginationInfo } from "@/components/shared/data-table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { z } from "zod";
import { useUser } from "@/hooks/use-user";

interface RecordData {
    id: string;
    name: string;
    sector: string;
    tempMin: number;
    tempMax: number;
    active: boolean;
}

type FoodForm = {
    name: string;
    sectorId: string;
    tempMin: number | undefined;
    tempMax: number | undefined;
};

type EditForm = FoodForm & {
    id?: string;
    active: boolean;
};

const foodSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório."),
    sectorId: z.string().uuid("Setor inválido."),
    tempMin: z.number().refine((value) => Number.isFinite(value), { message: "Temperatura mínima inválida." }),
    tempMax: z.number().refine((value) => Number.isFinite(value), { message: "Temperatura máxima inválida." }),
});

export default function FoodsPage() {
    const { user } = useUser()
    const userRole = user?.role ?? "COLABORATOR"
    const isAdmin = userRole === "ADMIN"

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

    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [sectors, setSectors] = useState<any>([]);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [createForm, setCreateForm] = useState<FoodForm>({
        name: "",
        sectorId: "",
        tempMin: undefined,
        tempMax: undefined,
    });

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [deletingItem, setDeletingItem] = useState<any>(null);

    const handleOpenDeleteModal = (item: any) => {
        setIsDeleteModalOpen(true);
        setDeletingItem(item);
    }
    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setDeletingItem(null);
    }

    const handleConfirmDelete = async (id: string) => {
        const response: any = await api.delete(`/foods/${id}`);
        setIsDeleteModalOpen(false);
        fetchFoods(1, filters);
        toast.success(`Alimento ${deletingItem?.name} deletado com sucesso.`);
        handleCloseDeleteModal();
        setDeletingItem(null);
    }

    const [useAutomaticName, setUseAutomaticName] = useState<boolean>(false);
    const [savedName, setSavedName] = useState<string>("");

    const parseNumberInput = (value: string) => (value === "" ? undefined : Number(value));

    const validateFoodPayload = (payload: FoodForm) => {
        const result = foodSchema.safeParse(payload);
        if (!result.success) {
            const message = result.error.issues[0]?.message ?? "Dados inválidos.";
            toast.error(message);
            return null;
        }
        return result.data;
    };

    const handleCancelCreate = () => {
        setIsCreateModalOpen(false);
        setCreateForm({
            name: "",
            sectorId: "",
            tempMin: undefined,
            tempMax: undefined,
        });
        setUseAutomaticName(false);
        setSavedName("");
    }

    function createAutomaticName() {
        const sector = sectors.find((sector: any) => sector.id === createForm.sectorId);
        if (sector) {
            return sector.name.slice(0, -1) + " " + (sector._count.foods + 1);
        }
    }

    useEffect(() => {
        if (useAutomaticName) {
            setSavedName(createForm.name)
            const automaticName = createAutomaticName();
            // @ts-ignore
            setCreateForm((prev) => ({ ...prev, name: automaticName }));
        } else {
            // @ts-ignore
            setCreateForm((prev) => ({ ...prev, name: savedName }));
        }
    }, [useAutomaticName])

    const handleCreateFood = async () => {
        const payload = {
            ...createForm,
            tempMin: Number(createForm.tempMin),
            tempMax: Number(createForm.tempMax),
        };

        const parsedPayload = validateFoodPayload(payload);
        if (!parsedPayload) return;

        const response: any = await api.post(`/foods`, parsedPayload);
        setIsCreateModalOpen(false);
        setCreateForm({
            name: "",
            sectorId: "",
            tempMin: undefined,
            tempMax: undefined,
        });
        fetchFoods(1, filters);
        setUseAutomaticName(false);
    }

    const fetchSectors = useCallback(async () => {
        const response: any = await api.get(`/sectors/filters?foodsCount=true`);
        setSectors(response);
    }, []);

    useEffect(() => {
        fetchSectors();
    }, [fetchSectors]);

    const [editForm, setEditForm] = useState<EditForm>({
        id: undefined,
        name: "",
        active: true,
        sectorId: "",
        tempMin: undefined,
        tempMax: undefined,
    });

    const handleEditFood = async (record: RecordData) => {
        const response: any = await api.get(`/foods/${record.id}`);
        setEditForm({
            id: response?.id ?? "",
            name: response?.name ?? "",
            active: response?.active ?? true,
            sectorId: response?.sectorId ?? "",
            tempMin: response?.tempMin ?? undefined,
            tempMax: response?.tempMax ?? undefined,
        });
        setIsEditModalOpen(true);
    }

    const handleConfirmEdit = async () => {
        const parsedPayload = validateFoodPayload({
            name: editForm.name,
            sectorId: editForm.sectorId,
            tempMin: Number(editForm.tempMin),
            tempMax: Number(editForm.tempMax),
        });
        if (!parsedPayload) return;

        const { id } = editForm;
        if (!id) {
            toast.error("Alimento inválido para edição.");
            return;
        }
        const payload = {
            ...parsedPayload,
            active: editForm.active,
        };

        const response: any = await api.patch(`/foods/${id}`, payload);
        setIsEditModalOpen(false);
        fetchFoods(1, filters);
    }

    const handleCancelEdit = () => {
        setIsEditModalOpen(false);
        setEditForm({
            id: undefined,
            name: "",
            active: true,
            sectorId: "",
            tempMin: undefined,
            tempMax: undefined,
        });
    }
    const handleOpenCreateModal = () => {
        setIsCreateModalOpen(true);
        setCreateForm({
            name: "",
            sectorId: "",
            tempMin: undefined,
            tempMax: undefined,
        });
    }

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
            
            console.log(response.foods)

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
                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6 hover:bg-transparent hover:cursor-pointer"
                        onClick={() => handleEditFood(record)}
                        disabled={!isAdmin}
                    >
                        <PencilIcon className="w-6 h-6" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="w-6 h-6 hover:bg-transparent hover:cursor-pointer" 
                        onClick={() => handleOpenDeleteModal(record)} 
                        disabled={!isAdmin}
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

            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[560px]">
                    <DialogHeader>
                        <DialogTitle>Editar Alimento</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="food-name">Nome</Label>
                            <Input
                                id="food-name"
                                value={editForm.name}
                                onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))}
                                placeholder="Nome do alimento"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="food-sector">Setor</Label>
                            <Select
                                value={editForm.sectorId}
                                onValueChange={(value) => setEditForm((prev) => ({ ...prev, sectorId: value }))}
                            >
                                <SelectTrigger id="food-sector">
                                    <SelectValue placeholder="Selecione o setor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sectors?.map((sector: any) => (
                                        <SelectItem key={sector.id} value={sector.id}>
                                            {sector.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="food-status">Status</Label>
                            <div className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2">
                                <span className={`text-sm text-gray-700 ${editForm.active ? "text-green-500" : "text-red-500"}`}>
                                    {editForm.active ? "Ativo" : "Inativo"}
                                </span>
                                <button
                                    id="food-status"
                                    type="button"
                                    role="switch"
                                    aria-checked={editForm.active}
                                    onClick={() => setEditForm((prev) => ({ ...prev, active: !prev.active }))}
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
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="food-temp-min">Temperatura mínima</Label>
                                <Input
                                    id="food-temp-min"
                                    type="number"
                                    step="0.01"
                                    value={editForm.tempMin ?? ""}
                                    onChange={(event) =>
                                        setEditForm((prev) => ({ ...prev, tempMin: parseNumberInput(event.target.value) }))
                                    }
                                    placeholder="0"
                                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="food-temp-max">Temperatura máxima</Label>
                                <Input
                                    id="food-temp-max"
                                    type="number"
                                    step="0.01"
                                    value={editForm.tempMax ?? ""}
                                    onChange={(event) =>
                                        setEditForm((prev) => ({ ...prev, tempMax: parseNumberInput(event.target.value) }))
                                    }
                                    placeholder="0"
                                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => handleCancelEdit()}>
                            Cancelar
                        </Button>
                        <Button onClick={() => handleConfirmEdit()}>
                            Salvar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-[560px]">
                    <DialogHeader>
                        <DialogTitle>Novo Alimento</DialogTitle>
                        <DialogDescription>Cadastre um novo alimento para controle de temperatura e conformidade.</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 w-full">
                        <div className="grid gap-2">
                            <Label htmlFor="food-sector">Setor</Label>
                            <Select
                                value={createForm.sectorId}
                                onValueChange={(value) => setCreateForm((prev) => ({ ...prev, sectorId: value }))}
                            >
                                <SelectTrigger id="food-sector" className="w-full">
                                    <SelectValue placeholder="Selecione o setor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sectors?.map((sector: any) => (
                                        <SelectItem key={sector.id} value={sector.id}>
                                            {sector.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="grid gap-2">
                            <Label htmlFor="food-name">Nome</Label>
                            <Input
                                id="food-name"
                                value={createForm.name}
                                onChange={(event) => setCreateForm((prev) => ({ ...prev, name: event.target.value }))}
                                className="w-full"
                                disabled={useAutomaticName}
                            />
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="use-automatic-name"
                                    checked={useAutomaticName}
                                    onCheckedChange={(checked) => setUseAutomaticName(checked === true)}
                                />
                                <Label htmlFor="use-automatic-name" className="text-sm text-muted-foreground font-normal cursor-pointer">
                                    Nome automático
                                </Label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="food-temp-min">Temperatura mínima</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="food-temp-min"
                                        type="number"
                                        step="0.01"
                                        value={createForm.tempMin ?? ""}
                                        className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        onChange={(event) =>
                                            setCreateForm((prev) => ({ ...prev, tempMin: parseNumberInput(event.target.value) }))
                                        }
                                    />
                                    <span className="text-sm text-muted-foreground">°C</span>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="food-temp-max">Temperatura máxima</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="food-temp-max"
                                        type="number"
                                        step="0.01"
                                        value={createForm.tempMax ?? ""}
                                        className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        onChange={(event) =>
                                            setCreateForm((prev) => ({ ...prev, tempMax: parseNumberInput(event.target.value) }))
                                        }
                                    />
                                    <span className="text-sm text-muted-foreground">°C</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button variant="outline" onClick={() => handleCancelCreate()} className="w-full sm:w-auto">
                            Cancelar
                        </Button>
                        <Button onClick={() => handleCreateFood()} className="w-full sm:w-auto">
                            Adicionar
                        </Button>
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