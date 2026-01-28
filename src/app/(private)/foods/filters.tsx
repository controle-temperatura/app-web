"use client"

import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { FilterIcon, PowerIcon, SearchIcon, UtensilsCrossedIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export interface FilterValues {
    sectorId: string;
    active: boolean;
    search: string;
}

interface FiltersProps {
    onFilterChange?: (filters: FilterValues) => void;
}

export default function Filters({ onFilterChange }: FiltersProps) {
    const [sectors, setSectors] = useState<any>([]);
    const [selectedSector, setSelectedSector] = useState<string>("");
    const [selectedActive, setSelectedActive] = useState<boolean>(false);
    const [searchText, setSearchText] = useState<string>("");

    const fetchFilterOptions = async () => {
        const response = await api.get("/sectors/filters");
        setSectors(response);
    }

    useEffect(() => {
        fetchFilterOptions();
    }, []);

    useEffect(() => {
        if (onFilterChange) {
            onFilterChange({
                sectorId: selectedSector,
                active: selectedActive,
                search: searchText,
            });
        }
    }, [selectedSector, selectedActive, searchText]);

    return (
        <div className="flex flex-row gap-4">
            <Select value={selectedSector} onValueChange={(value) => setSelectedSector(value === "_clear_" ? "" : value)}  >
                <SelectTrigger id="sector-filter" className="w-full cursor-pointer">
                    <span className="flex items-center gap-2">
                        <UtensilsCrossedIcon className="w-4 h-4 text-primary" />
                        <SelectValue placeholder="Setor"  className="w-full" />
                    </span> 
                </SelectTrigger>
                <SelectContent>
                    <SelectItem key="all" value="_clear_">Todos os setores</SelectItem>
                    {sectors?.map((sector: any) => (
                        <SelectItem key={sector.id} value={sector.id}>{sector.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={selectedActive.toString()} onValueChange={(value) => setSelectedActive(value === "true")}>
                <SelectTrigger id="active-filter" className="w-full cursor-pointer">
                    <span className="flex items-center gap-2">
                        <PowerIcon className="w-4 h-4 text-primary" />
                        <SelectValue placeholder="Status"  className="w-full" />
                    </span>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem key="all" value="_clear_">Todos</SelectItem>
                    {[true, false].map((active) => (
                        <SelectItem key={active.toString()} value={active.toString()}>{active ? "Ativo" : "Inativo"}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none z-10" />
                <Input 
                    type="text" 
                    placeholder="Pesquisar" 
                    className="w-56 pl-10"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
            </div>
        </div>
    )
}