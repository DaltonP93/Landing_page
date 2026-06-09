import site from '@/data/site.json';

type Rates = Record<string, number>;

const RATES: Rates = (site.billing as { rates?: Rates }).rates || { PYG: 1 };
const BASE = site.billing.currency || 'PYG';

export const CURRENCIES: string[] = (site.billing as { currencies?: string[] }).currencies || ['PYG'];

/** Convierte un monto desde la moneda base a la moneda destino. */
export function convert(amount: number, to: string): number {
  const rate = RATES[to] ?? 1;
  return amount * rate;
}

/** Formatea un monto (en moneda base) mostrándolo en la moneda indicada. */
export function formatMoney(amountBase: number, currency: string = BASE): string {
  const value = convert(amountBase, currency);
  if (currency === 'PYG') return `Gs. ${Math.round(value).toLocaleString('es-PY')}`;
  if (currency === 'USD') return `US$ ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `${currency} ${value.toLocaleString('es-PY')}`;
}
