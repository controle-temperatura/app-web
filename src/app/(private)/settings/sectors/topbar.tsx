import { Button } from "@/components/ui/button";
import Filters, { FilterValues } from "./filters";
import { PlusIcon } from "lucide-react";

interface TopbarProps {
    onFilterChange?: (filters: FilterValues) => void;
    handleOpenCreateModal?: () => void;
}

export default function Topbar({ onFilterChange, handleOpenCreateModal }: TopbarProps) {
    return (
        <div className="flex flex-row justify-between items-center">
            <Filters onFilterChange={onFilterChange} />
            <Button className="hover:cursor-pointer w-32" onClick={handleOpenCreateModal}>
                <PlusIcon className="w-4 h-4" />
                <span>Adicionar</span>
            </Button>
        </div>
    )
}