import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface DashboardCardProps {
    icon: React.ReactNode;
    value: string;
    text: string;
    color: string;
}

export default function DashboardCard({ icon, value, text, color }: DashboardCardProps) {
    return (
        <Card className="h-32 gap-1">
            <CardHeader>
                <div className="flex items-center text-2xl">
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold text-${color}`}>{value}</div>
                <div className="text-sm text-primary font-bold">{text}</div>
            </CardContent>
        </Card>
    )
}