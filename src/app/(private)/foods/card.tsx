import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface FoodsCardProps {
    value: number;
    text: string;
}

export default function FoodsCard({ value, text }: FoodsCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-brand-blue  text-2xl">{value}</CardTitle>
                <CardDescription className="text-muted-foreground text-sm">{text}</CardDescription>
            </CardHeader>
        </Card>
    )
}