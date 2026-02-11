import { Input } from "@/components/ui/input";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { PowerIcon, SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";

export interface FilterValues {
    active: boolean | null;
    search: string;
}

interface FiltersProps {
    onFilterChange?: (filters: FilterValues) => void;
}

export default function Filters({ onFilterChange }: FiltersProps) {
    const [selectedActive, setSelectedActive] = useState<boolean | null>(null);
    const [searchText, setSearchText] = useState<string>("");

    useEffect(() => {
        if (onFilterChange) {
            onFilterChange({
                active: selectedActive,
                search: searchText,
            });
        }
    }, [selectedActive, searchText]);

    return (
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
            <Select value={selectedActive === null ? "_clear_" : selectedActive.toString()} onValueChange={(value) => setSelectedActive(value === "_clear_" ? null : value === "true")}>
                <SelectTrigger id="active-filter" className="w-full sm:w-auto cursor-pointer">
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
            <div className="relative w-full sm:w-56">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none z-10" />
                <Input 
                    type="text" 
                    placeholder="Pesquisar" 
                    value={searchText} 
                    onChange={(e) => setSearchText(e.target.value)} 
                    className="w-full pl-10" 
                />
            </div>
        </div>
    )
}