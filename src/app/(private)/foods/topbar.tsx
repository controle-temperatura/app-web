import { Button } from "@/components/ui/button";
import Filters, { FilterValues } from "./filters";
import { PlusIcon } from "lucide-react";
import { useUser } from "@/hooks/use-user";

interface TopbarProps {
    onFilterChange?: (filters: FilterValues) => void;
    handleOpenCreateModal?: () => void;
}

export default function Topbar({ onFilterChange, handleOpenCreateModal }: TopbarProps) {
    const { user } = useUser()
    const userRole = user?.role ?? "COLABORATOR"
    const isAdmin = userRole === "ADMIN"

    return (
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
            <Filters onFilterChange={onFilterChange} />
            
            {isAdmin && (
                <Button className="hover:cursor-pointer w-full sm:w-32" onClick={handleOpenCreateModal}>
                    <PlusIcon className="w-4 h-4" />
                    <span>Adicionar</span>
                </Button>
            )}
        </div>
    )
}