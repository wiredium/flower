/**
 * Formats a date to a readable string
 */
export function formatDate(date: Date, locale = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

/**
 * Gets the relative time from now
 */
export function getRelativeTime(date: Date, locale = 'en-US'): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  const daysDiff = Math.round((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  
  if (Math.abs(daysDiff) < 1) {
    const hoursDiff = Math.round((date.getTime() - Date.now()) / (1000 * 60 * 60))
    if (Math.abs(hoursDiff) < 1) {
      const minutesDiff = Math.round((date.getTime() - Date.now()) / (1000 * 60))
      return rtf.format(minutesDiff, 'minute')
    }
    return rtf.format(hoursDiff, 'hour')
  }
  
  return rtf.format(daysDiff, 'day')
}

/**
 * Checks if a date is valid
 */
export function isValidDate(date: unknown): date is Date {
  return date instanceof Date && !isNaN(date.getTime())
}