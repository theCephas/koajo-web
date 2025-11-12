"use client";

export const resolveApiMessage = (
  message: string | string[] | undefined,
  fallback: string
): string => {
  if (Array.isArray(message)) {
    const first = message.find(
      (value) => typeof value === "string" && value.trim().length > 0
    );
    return first ? first.trim() : fallback;
  }

  if (typeof message === "string" && message.trim().length > 0) {
    return message.trim();
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
