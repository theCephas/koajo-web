/**
 * Payment and Date Utilities
 * Handles date calculations and payment retry logic for pod contributions
 */

/**
 * Checks if a date matches today's date (ignoring time)
 */
export function isToday(date: string | Date): boolean {
  const targetDate = typeof date === "string" ? new Date(date) : date;
  const today = new Date();

  return (
    targetDate.getFullYear() === today.getFullYear() &&
    targetDate.getMonth() === today.getMonth() &&
    targetDate.getDate() === today.getDate()
  );
}

/**
 * Checks if a date is in the past
 */
export function isPast(date: string | Date): boolean {
  const targetDate = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  return targetDate < today;
}

/**
 * Checks if a date is in the future
 */
export function isFuture(date: string | Date): boolean {
  const targetDate = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  return targetDate > today;
}

/**
 * Checks if we're within the grace period
 */
export function isWithinGracePeriod(
  currentDate: Date,
  graceEndsAt: string | Date | undefined
): boolean {
  if (!graceEndsAt) return false;

  const graceEndDate =
    typeof graceEndsAt === "string" ? new Date(graceEndsAt) : graceEndsAt;
  return currentDate <= graceEndDate;
}

/**
 * Checks if a contribution is due (today or overdue but within grace period)
 */
export function isContributionDue(
  nextContributionDate: string | Date,
  graceEndsAt?: string | Date
): boolean {
  const contributionDate =
    typeof nextContributionDate === "string"
      ? new Date(nextContributionDate)
      : nextContributionDate;
  const now = new Date();

  // If contribution date is today or in the past
  if (isToday(contributionDate) || isPast(contributionDate)) {
    // If there's no grace period, it's always due
    if (!graceEndsAt) return true;

    // If there's a grace period, check if we're still within it
    return isWithinGracePeriod(now, graceEndsAt);
  }

  return false;
}

/**
 * Calculates the next retry time using exponential backoff
 * @param attemptNumber - The retry attempt number (0-indexed)
 * @param baseDelayMinutes - Base delay in minutes (default: 60 = 1 hour)
 * @returns Date object for the next retry time
 */
export function calculateNextRetryTime(
  attemptNumber: number,
  baseDelayMinutes: number = 60
): Date {
  // Exponential backoff: 1hr, 2hr, 4hr, 8hr, etc.
  const delayMinutes = baseDelayMinutes * Math.pow(2, attemptNumber);

  // Cap at 24 hours
  const cappedDelayMinutes = Math.min(delayMinutes, 24 * 60);

  const nextRetryTime = new Date();
  nextRetryTime.setMinutes(nextRetryTime.getMinutes() + cappedDelayMinutes);

  return nextRetryTime;
}

/**
 * Calculates days remaining in grace period
 */
export function getDaysRemainingInGracePeriod(
  graceEndsAt: string | Date | undefined
): number {
  if (!graceEndsAt) return 0;

  const graceEndDate =
    typeof graceEndsAt === "string" ? new Date(graceEndsAt) : graceEndsAt;
  const now = new Date();

  const diffTime = graceEndDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

/**
 * Formats a date to ISO string for API calls
 */
export function formatDateForAPI(date: Date): string {
  return date.toISOString();
}

/**
 * Parses a date string safely
 */
export function parseDate(dateString: string): Date | null {
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

/**
 * Gets the start of today (00:00:00)
 */
export function getStartOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Gets the end of today (23:59:59)
 */
export function getEndOfToday(): Date {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return today;
}

/**
 * Calculates the next contribution date based on cadence
 */
export function calculateNextContributionDate(
  currentDate: Date,
  cadence: "bi-weekly" | "monthly"
): Date {
  const nextDate = new Date(currentDate);

  if (cadence === "bi-weekly") {
    nextDate.setDate(nextDate.getDate() + 14);
  } else {
    // Monthly
    nextDate.setMonth(nextDate.getMonth() + 1);
  }

  return nextDate;
}

/**
 * Retry strategy configuration
 */
export interface RetryStrategy {
  maxAttempts: number;
  baseDelayMinutes: number;
  shouldRetry: (attemptNumber: number, graceEndsAt?: Date) => boolean;
}

/**
 * Default retry strategy with exponential backoff until grace period ends
 */
export const DEFAULT_RETRY_STRATEGY: RetryStrategy = {
  maxAttempts: 10, // Maximum 10 retry attempts
  baseDelayMinutes: 60, // Start with 1 hour delay
  shouldRetry: (attemptNumber: number, graceEndsAt?: Date): boolean => {
    if (attemptNumber >= 10) return false; // Max attempts reached

    if (!graceEndsAt) return true; // No grace period, keep retrying

    const now = new Date();
    return isWithinGracePeriod(now, graceEndsAt); // Retry only within grace period
  },
};

/**
 * Determines if a payment should be retried based on strategy
 */
export function shouldRetryPayment(
  attemptNumber: number,
  graceEndsAt?: string | Date,
  strategy: RetryStrategy = DEFAULT_RETRY_STRATEGY
): boolean {
  const graceEndDate = graceEndsAt
    ? typeof graceEndsAt === "string"
      ? new Date(graceEndsAt)
      : graceEndsAt
    : undefined;

  return strategy.shouldRetry(attemptNumber, graceEndDate);
}

/**
 * Converts amount from cents to major currency unit
 */
export function centsToMajor(cents: number): number {
  return cents / 100;
}

/**
 * Converts amount from major currency unit to cents
 */
export function majorToCents(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Formats currency amount for display
 */
export function formatCurrency(
  amount: number,
  currency: string = "NGN"
): string {
  const majorAmount = centsToMajor(amount);

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currency,
  }).format(majorAmount);
}

/**
 * Validates if a contribution date is valid
 */
export function isValidContributionDate(date: string | Date): boolean {
  const contributionDate =
    typeof date === "string" ? parseDate(date) : date;

  if (!contributionDate) return false;

  // Contribution date should not be more than 1 year in the future
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  return contributionDate <= oneYearFromNow;
}
