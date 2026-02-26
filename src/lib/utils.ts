import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateToDDMMYYYY(isoDate: string): string {
  if (!isoDate) return ""
  const [y, m, d] = isoDate.split("-")
  return [d, m, y].filter(Boolean).join("/")
}

export function sanitizeTemperatureInput(value: string): string {
  const noComma = value.replace(/,/g, "")
  const onlyDigitsAndDot = noComma.replace(/[^0-9.]/g, "")
  const parts = onlyDigitsAndDot.split(".")
  if (parts.length <= 2) return onlyDigitsAndDot
  return parts[0] + "." + parts.slice(1).join("")
}
