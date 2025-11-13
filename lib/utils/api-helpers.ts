"use client";

/**
 * Formats an ISO date string to MM/DD/YY format
 */
const formatDateToMMDDYY = (isoDateString: string): string => {
  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) {
      return isoDateString;
    }

    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);

    return `${month}/${day}/${year}`;
  } catch {
    return isoDateString;
  }
};

/**
 * Formats ISO date strings found in error messages to MM/DD/YY format
 */
const formatDatesInMessage = (message: string): string => {
  // Match ISO 8601 date-time strings (e.g., 2025-11-18T23:13:22.024Z)
  const isoDateRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z/g;

  return message.replace(isoDateRegex, (match) => formatDateToMMDDYY(match));
};

export const resolveApiMessage = (
  message: string | string[] | undefined,
  fallback: string
): string => {
  if (Array.isArray(message)) {
    const first = message.find(
      (value) => typeof value === "string" && value.trim().length > 0
    );
    return first ? formatDatesInMessage(first.trim()) : fallback;
  }

  if (typeof message === "string" && message.trim().length > 0) {
    return formatDatesInMessage(message.trim());
  }

  return fallback;
};

const tryExtractMessage = (
  source: unknown
): string | string[] | undefined => {
  if (!source || typeof source !== "object") {
    return undefined;
  }

  const candidate = (source as { message?: unknown }).message;
  if (typeof candidate === "string" || Array.isArray(candidate)) {
    return candidate as string | string[];
  }

  return undefined;
};

export const getApiErrorMessage = (
  source: unknown
): string | string[] | undefined => {
  if (!source) return undefined;

  if (typeof source === "string" || Array.isArray(source)) {
    return source as string | string[];
  }

  if (source instanceof Error) {
    return source.message;
  }

  if (typeof source === "object") {
    const direct = tryExtractMessage(source);
    if (direct) return direct;

    const withResponse = tryExtractMessage(
      (source as { response?: unknown }).response
    );
    if (withResponse) return withResponse;

    const responseData = tryExtractMessage(
      (source as { response?: { data?: unknown } }).response?.data
    );
    if (responseData) return responseData;

    const data = tryExtractMessage((source as { data?: unknown }).data);
    if (data) return data;

    const body = tryExtractMessage((source as { body?: unknown }).body);
    if (body) return body;
  }

  return undefined;
};

export const resolveApiErrorMessage = (
  source: unknown,
  fallback: string
): string => resolveApiMessage(getApiErrorMessage(source), fallback);
