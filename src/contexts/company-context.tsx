"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"
import { api } from "@/lib/api"

interface Company {
    id: string
    name: string
    shortName?: string
    logoUrl?: string
    cnpj?: string
    address?: string
    contactPhone?: string
    contactMail?: string
}

interface CompanyContextType {
    company: Company | null
    isLoading: boolean
    error: string | null
    refetch: () => Promise<void>
    updateCompany: (data: Partial<Company>) => Promise<void>
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined)

export function CompanyProvider({ children }: { children: ReactNode }) {
    const [company, setCompany] = useState<Company | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchCompany = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const data = await api.get<Company>("/company")
            setCompany(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao carregar empresa")
            setCompany(null)
        } finally {
            setIsLoading(false)
        }
    }, [])

    const updateCompany = useCallback(async (data: Partial<Company>) => {
        try {
            setError(null)
            console.log(company?.id, data)
            const updatedCompany = await api.put<Company>(`/company/${company?.id}`, data)
            setCompany(updatedCompany)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar empresa"
            setError(errorMessage)
            throw new Error(errorMessage)
        }
    }, [])

    useEffect(() => {
        fetchCompany()
    }, [fetchCompany])

    return (
        <CompanyContext.Provider 
            value={{ 
                company, 
                isLoading, 
                error, 
                refetch: fetchCompany,
                updateCompany 
            }}
        >
            {children}
        </CompanyContext.Provider>
    )
}

export function useCompany() {
    const context = useContext(CompanyContext)
    if (context === undefined) {
        throw new Error("useCompany must be used within a CompanyProvider")
    }
    return context
}
