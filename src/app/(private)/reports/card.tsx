import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ReportsCardProps {
    title: string;
    description: string;
    value: string;
    icon: React.ReactNode;
    onClick: () => void;
}

export default function ReportsCard({ title, description, value, icon, onClick }: ReportsCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><span className="text-2xl">{icon}</span> {title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <Button variant={value === "CUSTOM" ? "outline" : "default"} disabled={value === "CUSTOM"} size="icon" className="w-full hover:cursor-pointer" onClick={onClick}>{value === "CUSTOM" ? "Em desenvolvimento" : "Gerar Relatório"}</Button>
            </CardContent>
        </Card>
    )
}