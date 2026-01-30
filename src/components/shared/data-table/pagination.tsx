"use client"

import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useEffect } from "react";

export interface PaginationInfo {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
}

export interface PaginationProps {
    pagination: PaginationInfo;
    onPageChange: (page: number) => void;
    disabled?: boolean;
    recordsCount?: number;
}

export function Pagination({ 
    pagination, 
    onPageChange, 
    disabled = false,
    recordsCount 
}: PaginationProps) {

    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;
        let startPage = Math.max(1, pagination.page - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(pagination.totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    };

    const displayRecordsCount = recordsCount ?? 0;

    return (
        <div className="flex items-center justify-between px-2 py-4">
            <div className="text-sm text-muted-foreground">
                Mostrando {displayRecordsCount > 0 ? ((pagination.page - 1) * pagination.limit + 1) : 0} a{" "}
                {Math.min(pagination.page * pagination.limit, pagination.totalRecords)} de{" "}
                {pagination.totalRecords} registros
            </div>
            <div className="flex items-center gap-2">
                <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => onPageChange(1)} 
                    disabled={pagination.page === 1 || disabled}
                >
                    <ChevronLeftIcon className="w-4 h-4" />
                    <ChevronLeftIcon className="w-4 h-4 -ml-3" />
                </Button>
                <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => onPageChange(pagination.page - 1)} 
                    disabled={pagination.page === 1 || disabled}
                >
                    <ChevronLeftIcon className="w-4 h-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                    {getPageNumbers().map((pageNum) => (
                        <Button
                            key={pageNum}
                            variant={pageNum === pagination.page ? "default" : "outline"}
                            size="icon"
                            onClick={() => onPageChange(pageNum)}
                            disabled={disabled}
                            className="w-10"
                        >
                            {pageNum}
                        </Button>
                    ))}
                </div>

                <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => onPageChange(pagination.page + 1)} 
                    disabled={pagination.page === pagination.totalPages || disabled}
                >
                    <ChevronRightIcon className="w-4 h-4" />
                </Button>
                <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => onPageChange(pagination.totalPages)} 
                    disabled={pagination.page === pagination.totalPages || disabled}
                >
                    <ChevronRightIcon className="w-4 h-4" />
                    <ChevronRightIcon className="w-4 h-4 -ml-3" />
                </Button>
            </div>
        </div>
    );
}
