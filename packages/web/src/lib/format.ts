/** Currency + date/time formatting helpers (₹ / en-IN). */

const moneyFmt = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatMoney(amount: number): string {
  return moneyFmt.format(amount);
}

export function formatMoneyRange(min: number | null, max: number | null): string {
  if (min == null || max == null) return '—';
  if (min === max) return formatMoney(min);
  return `${formatMoney(min)} – ${formatMoney(max)}`;
}

const dateTimeFmt = new Intl.DateTimeFormat('en-IN', {
  dateStyle: 'medium',
  timeStyle: 'short',
});
const dateFmt = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' });

export function formatDateTime(iso: string | Date): string {
  return dateTimeFmt.format(typeof iso === 'string' ? new Date(iso) : iso);
}

export function formatDate(iso: string | Date): string {
  return dateFmt.format(typeof iso === 'string' ? new Date(iso) : iso);
}

/** mm:ss countdown from a number of seconds remaining. */
export function formatCountdown(secondsRemaining: number): string {
  const s = Math.max(0, Math.floor(secondsRemaining));
  const mm = Math.floor(s / 60)
    .toString()
    .padStart(2, '0');
  const ss = (s % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}
