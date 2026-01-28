"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2Icon } from "lucide-react";
import { ReactNode, useEffect } from "react";

export interface Column<T> {
    header: string;
    accessor?: keyof T;
    cell?: (row: T) => ReactNode;
    className?: string;
}

export interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    isLoading?: boolean;
    emptyMessage?: string;
    getRowClassName?: (row: T) => string;
    getRowKey: (row: T) => string | number;
}

export function DataTable<T>({
    columns,
    data,
    isLoading = false,
    emptyMessage = "Nenhum registro encontrado",
    getRowClassName,
    getRowKey,
}: DataTableProps<T>) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2Icon className="w-4 h-4 animate-spin" />
            </div>
        );
    }

    useEffect(() => {
        console.log(data)
    }, [data]);

    return (
        <Table>
            <TableHeader className="bg-slate-200 text-white">
                <TableRow>
                    {columns.map((column, index) => (
                        <TableHead key={index} className={column.className}>
                            {column.header}
                        </TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {data?.length > 0 ? (
                    data.map((row) => (
                        <TableRow
                            key={getRowKey(row)}
                            className={getRowClassName ? getRowClassName(row) : ""}
                        >
                            {columns.map((column, colIndex) => (
                                <TableCell key={colIndex} className={column.className}>
                                    {column.cell
                                        ? column.cell(row)
                                        : column.accessor
                                        ? String(row[column.accessor])
                                        : null}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={columns.length} className="text-center text-muted-foreground">
                            {emptyMessage}
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
