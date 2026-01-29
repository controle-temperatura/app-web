"use client"

import { useState } from "react";
import { FilterValues } from "./filters";

export default function SectorsPage() {
    const [sectors, setSectors] = useState<any>([]);
    const [sectorsLoading, setSectorsLoading] = useState<boolean>(false);
    const [sectorsData, setSectorsData] = useState<any>([]);

    
}