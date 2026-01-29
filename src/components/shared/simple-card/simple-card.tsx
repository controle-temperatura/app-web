import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SimpleCardProps {
    value: number;
    text: string;
}

export default function SimpleCard({ value, text }: SimpleCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-brand-blue  text-2xl">{value}</CardTitle>
                <CardDescription className="text-muted-foreground text-sm">{text}</CardDescription>
            </CardHeader>
        </Card>
    )
}