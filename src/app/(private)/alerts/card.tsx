import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AlertData {
    key: string;
    value: string | number;
}

interface AlertCardProps {
    title: string;
    description: string;
    data: AlertData[];
    textColor: string;
    backgroundColor: string;
}

export default function AlertCard({ title, description, data, textColor, backgroundColor }: AlertCardProps) {
    const borderColorMap: Record<string, string> = {
        'destructive': 'border-l-destructive',
        'yellow-500': 'border-l-yellow-500',
        'green-500': 'border-l-green-500',
        'blue-500': 'border-l-blue-500',
    };

    const borderClass = borderColorMap[textColor] || 'border-l-foreground';

    return (
        <Card 
            className={`${backgroundColor} ${borderClass} border-l-2 px-0 h-40 gap-2`}
        >
            <CardHeader className="px-2">
                <CardTitle className={`text-${textColor} text-sm`}>{title}</CardTitle>
                <CardDescription className="text-muted-foreground">{description}</CardDescription>
            </CardHeader>
            <CardContent className="overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="flex flex-col gap-2">
                    {data.map((item) => (
                        <div key={item.key} className="flex flex-row gap-1 items-center justify-between">
                            <span className="text-foreground font-medium">{item.key}</span>
                            <span className={`text-${textColor} font-bold`}>{item.value}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}