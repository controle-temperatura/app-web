import { AlertTriangleIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AlertComponentProps {
    title: string;
    item: string;
    description: string;
    registeredTemperature: string | number;
    recommendedTemperature: string | number;
    type: 'CRITICAL' | 'ALERT';
}

export function AlertComponent({
    title,
    item,
    description,
    registeredTemperature,
    recommendedTemperature,
    type,
}: AlertComponentProps) {
    const isCritical = type === 'CRITICAL';

    return (
        <div
            className={cn(
                'flex flex-col gap-2 rounded-[10px] border border-border border-l-4 p-4',
                isCritical
                    ? 'border-l-red-500 bg-red-500/10'
                    : 'border-l-yellow-500 bg-yellow-500/10'
            )}
        >
            <div className="flex w-full flex-row items-center justify-start gap-2">
                <AlertTriangleIcon
                    className={cn('h-5 w-5 shrink-0', isCritical ? 'text-red-500' : 'text-yellow-500')}
                />
                <span
                    className={cn(
                        'text-lg font-bold',
                        isCritical ? 'text-red-500' : 'text-yellow-500'
                    )}
                >
                    {title}
                </span>
            </div>
            <div className="flex flex-1 flex-row gap-1">
                <span className="truncate text-base font-bold text-foreground">{item}</span>
                <span className="min-w-0 flex-1 truncate text-base text-foreground">
                    {description}
                </span>
            </div>
            <div className="mt-2 flex w-full flex-row justify-between">
                <span className="text-base font-bold text-foreground">
                    Temperatura registrada:
                </span>
                <span
                    className={cn(
                        'text-base font-bold',
                        isCritical ? 'text-red-500' : 'text-yellow-500'
                    )}
                >
                    {String(registeredTemperature)}
                </span>
            </div>
            <div className="flex w-full flex-row justify-between">
                <span className="text-base font-bold text-foreground">
                    Temperatura recomendada:
                </span>
                <span className="text-base font-bold text-foreground">
                    {String(recommendedTemperature)}
                </span>
            </div>
        </div>
    );
}
