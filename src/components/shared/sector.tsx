import * as LucideIcons from 'lucide-react';
import { UtensilsCrossedIcon } from 'lucide-react';

export interface SectorData {
    name: string;
    icon?: string;
}

type IconComponentType = React.ComponentType<{ className?: string }>;

export function Sector({ sector }: { sector: SectorData }) {
    const iconKey = sector.icon ?? 'Circle';
    const iconsMap = LucideIcons as unknown as Record<string, IconComponentType>;
    const IconComponent = iconsMap[iconKey] ?? iconsMap[`${iconKey}Icon`];

    if (!IconComponent) {
        return (
            <div className="flex flex-col items-center justify-center gap-2">
                <UtensilsCrossedIcon className="h-10 w-10 text-foreground" />
                <span className="text-center text-lg font-medium">{sector.name}</span>
            </div>
        );
    }

    return (
        <div className="flex aspect-square flex-col items-center justify-center gap-2">
            <IconComponent className="h-10 w-10 text-foreground" />
            <span className="line-clamp-1 text-center text-lg font-semibold">{sector.name}</span>
        </div>
    );
}
