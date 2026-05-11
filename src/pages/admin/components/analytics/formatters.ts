/** Shared formatters for the platform analytics dashboard charts. */

const DEFAULT_LOCALE = 'en-US';

export function formatCurrency(amount: number, currency: string): string {
  const upperCurrency = currency.toUpperCase();
  try {
    return new Intl.NumberFormat(DEFAULT_LOCALE, {
      style: 'currency',
      currency: upperCurrency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // Falls back if currency code is non-standard (e.g. test data).
    return `${upperCurrency} ${amount.toLocaleString(DEFAULT_LOCALE, {
      maximumFractionDigits: 0,
    })}`;
  }
}

export function formatCurrencyCompact(amount: number, currency: string): string {
  const upperCurrency = currency.toUpperCase();
  try {
    return new Intl.NumberFormat(DEFAULT_LOCALE, {
      style: 'currency',
      currency: upperCurrency,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  } catch {
    return `${upperCurrency} ${amount.toLocaleString(DEFAULT_LOCALE, {
      notation: 'compact',
      maximumFractionDigits: 1,
    })}`;
  }
}

export function formatInteger(value: number): string {
  return value.toLocaleString(DEFAULT_LOCALE, { maximumFractionDigits: 0 });
}

/** Renders an ISO `YYYY-MM-DD` as a short locale date (e.g. "May 11"). */
export function formatShortDay(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function humanizeSubscriptionStatus(status: string): string {
  if (status.length === 0) {
    return 'Unknown';
  }
  return status
    .split('_')
    .map((part) =>
      part.length === 0 ? part : part[0].toUpperCase() + part.slice(1),
    )
    .join(' ');
}
