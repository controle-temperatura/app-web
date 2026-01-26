"use client"

import { CalendarIcon, FilterIcon, UtensilsCrossedIcon, SaladIcon, AlertCircleIcon, AlertTriangleIcon, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

export interface FilterValues {
    date: string;
    sectorId: string;
    foodId: string;
    alertType: string;
    danger: string;
    search: string;
}

interface FiltersProps {
    onFilterChange?: (filters: FilterValues) => void;
}

export default function Filters({ onFilterChange }: FiltersProps) {
    const [filterOptions, setFilterOptions] = useState<any>([]);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [selectedSector, setSelectedSector] = useState<string>("");
    const [selectedAlertType, setSelectedAlertType] = useState<string>("");
    const [selectedDanger, setSelectedDanger] = useState<string>("");
    const [selectedFood, setSelectedFood] = useState<string>("");
    const [searchText, setSearchText] = useState<string>("");

    const [foods, setFoods] = useState<any>([]);

    const fetchFilterOptions = async () => {
        const response = await api.get("/filter-options/tables");
        setFilterOptions(response);
    }

    useEffect(() => {
        fetchFilterOptions();
    }, []);

    useEffect(() => {
        if (selectedSector) {
            const availableFoods = filterOptions?.foods?.filter((food: any) => food.sector.id === selectedSector);
            setFoods(availableFoods);
        } else {
            setFoods([]);
            setSelectedFood("");
        }
    }, [selectedSector, filterOptions])

    useEffect(() => {
        if (onFilterChange) {
            onFilterChange({
                date: selectedDate,
                sectorId: selectedSector,
                foodId: selectedFood,
                alertType: selectedAlertType,
                danger: selectedDanger,
                search: searchText,
            });
        }
    }, [selectedDate, selectedSector, selectedFood, selectedAlertType, selectedDanger, searchText])

    const alertTypeLabels = {
        "BELOW_MIN": "Abaixo do mínimo",
        "ABOVE_MAX": "Acima do máximo",
        "NEXT_MIN": "Próximo ao mínimo",
        "NEXT_MAX": "Próximo ao máximo",
    }

    const alertDangerLabels = {
        "CRITICAL": "Crítico",
        "ALERT": "Alerta"
    }


    return (
        <div className="flex flex-col gap-4 ">
            <div className="flex items-center gap-2">
                <FilterIcon className="h-4 w-4" />
                <h1 className="text-xl font-bold">Filtros</h1>
            </div>
            <div className="flex items-center gap-2">
                <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-5 gap-2">
                    <div className="flex flex-col gap-2">
                        <div 
                            className="relative w-full cursor-pointer"
                            onClick={() => {
                                const input = document.getElementById('date-filter') as HTMLInputElement;
                                input?.showPicker?.();
                            }}
                        >
                            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none z-10" />
                            <Input 
                                id="date-filter"
                                type="date" 
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full pl-10 cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-inner-spin-button]:hidden [&::-webkit-clear-button]:hidden"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 w-full">
                        <Select value={selectedSector} onValueChange={(value) => setSelectedSector(value === "_clear_" ? "" : value)}  >
                            <SelectTrigger id="sector-filter" className="w-full cursor-pointer">
                                <span className="flex items-center gap-2">
                                    <UtensilsCrossedIcon className="w-4 h-4 text-primary" />
                                    <SelectValue placeholder="Setor"  className="w-full" />
                                </span>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem key="all" value="_clear_">Todos os setores</SelectItem>
                                {filterOptions?.sectors?.map((sector: any) => (
                                    <SelectItem key={sector.id} value={sector.id}>{sector.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-2 w-full">
                        <Select value={selectedFood} onValueChange={(value) => setSelectedFood(value === "_clear_" ? "" : value)} disabled={!selectedSector}>
                            <SelectTrigger id="food-filter" className="w-full cursor-pointer">
                                <span className="flex items-center gap-2">
                                    <SaladIcon className="w-4 h-4 text-primary" />
                                    <SelectValue placeholder="Alimento" />
                                </span>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem key="all" value="_clear_">Todos os alimentos</SelectItem>
                                {foods?.map((food: any) => (
                                    <SelectItem key={food.id} value={food.id}>{food.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-2 w-full">
                        <Select value={selectedAlertType} onValueChange={(value) => setSelectedAlertType(value === "_clear_" ? "" : value)}>
                            <SelectTrigger id="alert-type-filter" className="w-full cursor-pointer">
                                <span className="flex items-center gap-2">
                                    <AlertCircleIcon className="w-4 h-4 text-primary" />
                                    <SelectValue placeholder="Tipo" />
                                </span>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem key="all" value="_clear_">Todos os tipos</SelectItem>
                                {filterOptions?.alertTypes?.map((alertType: any) => (
                                    <SelectItem key={alertType.value} value={alertType.value}>{alertTypeLabels[alertType.label as keyof typeof alertTypeLabels]}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-2 w-full">
                        <Select value={selectedDanger} onValueChange={(value) => setSelectedDanger(value === "_clear_" ? "" : value)}>
                            <SelectTrigger id="danger-filter" className="w-full cursor-pointer">
                                <span className="flex items-center gap-2">
                                    <AlertTriangleIcon className="w-4 h-4 text-primary" />
                                    <SelectValue placeholder="Nível" />
                                </span>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem key="all" value="_clear_">Todos os níveis</SelectItem>
                                {filterOptions?.alertDangers?.map((danger: any) => (
                                        <SelectItem key={danger.value} value={danger.value}>{alertDangerLabels[danger.label as keyof typeof alertDangerLabels]}</SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none z-10" />
                    <Input 
                        type="text" 
                        placeholder="Pesquisar" 
                        className="w-full pl-10"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>
            </div>
        </div>

    )
}