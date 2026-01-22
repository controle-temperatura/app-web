"use client"

import { CalendarIcon, FilterIcon, UtensilsCrossedIcon, SaladIcon, AlertCircleIcon, AlertTriangleIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";

export default function Filters() {
    const [filterOptions, setFilterOptions] = useState<any>([]);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [selectedSector, setSelectedSector] = useState<string>("");
    const [selectedAlertType, setSelectedAlertType] = useState<string>("");
    const [selectedDanger, setSelectedDanger] = useState<string>("");
    const [selectedFood, setSelectedFood] = useState<string>("");

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
        }
    }, [selectedSector])

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
                        <Select value={selectedSector} onValueChange={setSelectedSector}  >
                            <SelectTrigger id="sector-filter" className="w-full cursor-pointer">
                                <span className="flex items-center gap-2">
                                    <UtensilsCrossedIcon className="w-4 h-4 text-primary" />
                                    <SelectValue placeholder="Setor"  className="w-full" />
                                </span>
                            </SelectTrigger>
                            <SelectContent>
                                {filterOptions?.sectors?.map((sector: any) => (
                                    <SelectItem key={sector.id} value={sector.id}>{sector.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-2 w-full">
                        <Select value={selectedFood} onValueChange={setSelectedFood} disabled={!selectedSector}>
                            <SelectTrigger id="food-filter" className="w-full cursor-pointer">
                                <span className="flex items-center gap-2">
                                    <SaladIcon className="w-4 h-4 text-primary" />
                                    <SelectValue placeholder="Alimento" />
                                </span>
                            </SelectTrigger>
                            <SelectContent>
                                {foods?.map((food: any) => (
                                    <SelectItem key={food.id} value={food.id}>{food.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-2 w-full">
                        <Select value={selectedAlertType} onValueChange={setSelectedAlertType}>
                            <SelectTrigger id="alert-type-filter" className="w-full cursor-pointer">
                                <span className="flex items-center gap-2">
                                    <AlertCircleIcon className="w-4 h-4 text-primary" />
                                    <SelectValue placeholder="Tipo" />
                                </span>
                            </SelectTrigger>
                            <SelectContent>
                                {filterOptions?.alertTypes?.map((alertType: any) => (
                                    <SelectItem key={alertType.id} value={alertType.id}>{alertTypeLabels[alertType.value as keyof typeof alertTypeLabels]}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-2 w-full">
                        <Select value={selectedDanger} onValueChange={setSelectedDanger}>
                            <SelectTrigger id="danger-filter" className="w-full cursor-pointer">
                                <span className="flex items-center gap-2">
                                    <AlertTriangleIcon className="w-4 h-4 text-primary" />
                                    <SelectValue placeholder="Nível" />
                                </span>
                            </SelectTrigger>
                            <SelectContent>
                                {filterOptions?.alertDangers?.map((danger: any) => (
                                        <SelectItem key={danger.id} value={danger.id}>{alertDangerLabels[danger.value as keyof typeof alertDangerLabels]}</SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
 
    )
}