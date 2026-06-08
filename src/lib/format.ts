export function formatPYG(amount: number): string {
  return new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'PYG',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatWhatsAppLink(phone: string, message: string): string {
  const cleaned = phone.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}
