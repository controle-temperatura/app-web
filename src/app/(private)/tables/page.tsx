import Filters from "./filters";

export default function TablesPage() {
    
    return (
        <div className="flex flex-col gap-6">
            <Filters />
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold">aqui vai a tabela</h1>
                </div>
            </div>
        </div>
    )
}