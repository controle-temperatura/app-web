import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface ShowCardProps {
    text: string,
    value: string,
    icon: React.ReactNode,
    color: string
}

export default function ShowCard({ text, value, icon, color }: ShowCardProps) {

    return (
        <Card className="h-32 gap-1">
            <CardHeader>
                <div className={`text-2xl font-bold flex items-center gap-2`}><span className={`font-bold text-${color}`}>{icon}</span>{value}</div>
            </CardHeader>
            <CardContent>
                <div className="text-sm text-primary font-bold">{text}</div>
            </CardContent>
        </Card>
    )
}