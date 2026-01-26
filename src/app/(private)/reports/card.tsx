import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ReportsCardProps {
    title: string;
    description: string;
    value: string;
    icon: React.ReactNode;
}

export default function ReportsCard({ title, description, value, icon }: ReportsCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><span className="text-2xl">{icon}</span> {title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <Button variant={value === "CUSTOM" ? "outline" : "default"} size="icon" className="w-full hover:cursor-pointer">Gerar Relatório</Button>
            </CardContent>
        </Card>
    )
}