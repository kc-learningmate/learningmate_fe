import { format, type Locale } from 'date-fns';
import { tz, TZDate } from '@date-fns/tz';

export const KST_TZ_ID = 'Asia/Seoul';
export const KST = tz(KST_TZ_ID);

export function coerceNaiveAsUTC(input: string | number | Date): Date {
  if (typeof input === 'string') {
    if (/[Zz]|[+\-]\d{2}:\d{2}$/.test(input)) return new Date(input);
    return new Date(input + 'Z');
  }
  return new Date(input);
}

export function isSameKSTDay(
  a: string | number | Date,
  b: string | number | Date
): boolean {
  const A = new TZDate(a instanceof Date ? a : new Date(a), KST_TZ_ID);
  const B = new TZDate(b instanceof Date ? b : new Date(b), KST_TZ_ID);
  return (
    A.getFullYear() === B.getFullYear() &&
    A.getMonth() === B.getMonth() &&
    A.getDate() === B.getDate()
  );
}

export function kstDateKey(input: string | number | Date): string {
  return format(new Date(input), 'yyyy-MM-dd', { in: KST });
}

export function kstDateKeyFromBackend(iso: string): string {
  const d = coerceNaiveAsUTC(iso);
  return format(d, 'yyyy-MM-dd', { in: KST });
}

export function isTodayKST(input: string | number | Date): boolean {
  const a = kstDateKey(input);
  const b = format(new TZDate(new Date(), KST_TZ_ID), 'yyyy-MM-dd');
  return a === b;
}

export function formatKST(
  input: string | number | Date,
  fmt: string,
  opts?: { locale?: Locale }
) {
  return format(new Date(input), fmt, { ...(opts ?? {}), in: KST });
}

export function todayKSTLocalDate(): Date {
  const nowKST = new TZDate(new Date(), KST_TZ_ID);
  return new Date(nowKST.getFullYear(), nowKST.getMonth(), nowKST.getDate());
}

export function nowKstDateKey(): string {
  return format(new Date(), 'yyyy-MM-dd', { in: KST });
}

export function toKstDateKeyFromBackendLocalDateTime(naiveIso: string): string {
  const d = /[Zz]|[+\-]\d{2}:\d{2}$/.test(naiveIso)
    ? new Date(naiveIso)
    : new Date(naiveIso + 'Z');
  return format(d, 'yyyy-MM-dd', { in: KST });
}
