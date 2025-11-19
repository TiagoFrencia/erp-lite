export function formatCurrencyARS(n: number | null | undefined) {
  const v = typeof n === 'number' && !Number.isNaN(n) ? n : 0;
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(v);
}

export function formatDateTimeAR(iso: string | number | Date) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(d);
}

// Helper de clases (por si lo necesitás)
export function cn(...xs: Array<string | undefined | null | false>) {
  return xs.filter(Boolean).join(' ');
}
