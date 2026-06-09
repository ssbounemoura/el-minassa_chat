import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ar-DZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ar-DZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString("ar-DZ")} د.ج`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "مدير النظام",
  AVOCAT: "محامي",
  NOTAIRE: "موثق",
  HUISSIER: "محضر قضائي",
};

export const STATUS_LABELS: Record<string, string> = {
  EN_COURS: "قيد المعالجة",
  EN_ATTENTE: "في الانتظار",
  TERMINE: "منتهي",
  ANNULE: "ملغي",
  ARCHIVE: "مؤرشف",
};

export const INVOICE_STATUS_LABELS: Record<string, string> = {
  BROUILLON: "مسودة",
  ENVOYEE: "مرسلة",
  PAYEE: "مدفوعة",
  EN_RETARD: "متأخرة",
  ANNULEE: "ملغاة",
};
