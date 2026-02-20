import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Converte data ISO (yyyy-mm-dd) para exibição em pt-BR (dd/mm/yyyy) */
export function formatDateToDDMMYYYY(isoDate: string): string {
  if (!isoDate) return ""
  const [y, m, d] = isoDate.split("-")
  return [d, m, y].filter(Boolean).join("/")
}
