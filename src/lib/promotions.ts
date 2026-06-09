export interface Promotion {
  id: string;
  title: string;
  description: string;
  discountPercent: number;
  code: string;
  productIds: string[]; // vacío = aplica a todos los productos
  startsAt: string;
  endsAt: string;
  active: boolean;
  color: string;
}

/** Devuelve true si la promoción está activa y dentro del rango de fechas. */
export function isPromoLive(promo: Promotion, now: Date = new Date()): boolean {
  if (!promo.active) return false;
  const start = new Date(promo.startsAt).getTime();
  const end = new Date(promo.endsAt).getTime();
  const t = now.getTime();
  return t >= start && t <= end;
}

/** Todas las promociones vigentes en este momento. */
export function getLivePromotions(promos: Promotion[], now: Date = new Date()): Promotion[] {
  return promos.filter((p) => isPromoLive(p, now));
}

/** Mejor promoción aplicable a un producto (mayor descuento). */
export function getPromoForProduct(
  productId: string,
  promos: Promotion[],
  now: Date = new Date()
): Promotion | null {
  const applicable = getLivePromotions(promos, now).filter(
    (p) => p.productIds.length === 0 || p.productIds.includes(productId)
  );
  if (applicable.length === 0) return null;
  return applicable.reduce((best, p) => (p.discountPercent > best.discountPercent ? p : best));
}

/** Aplica un porcentaje de descuento y redondea a guaraníes. */
export function applyDiscount(price: number, percent: number): number {
  return Math.round((price * (100 - percent)) / 100);
}
