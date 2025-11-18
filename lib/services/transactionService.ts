import {
  API_ENDPOINTS,
  getApiUrl,
  getAuthHeaders,
} from "@/lib/constants/api";
import type {
  TransactionListParams,
  TransactionListResponse,
  ApiError,
} from "@/lib/types/api";
import { TokenManager } from "@/lib/utils/memory-manager";

/**
 * Build URL with query parameters for transactions
 */
function buildTransactionUrl(
  baseEndpoint: string,
  params: TransactionListParams = {}
): string {
  const url = new URL(getApiUrl(baseEndpoint));

  if (params.limit !== undefined) {
    url.searchParams.set("limit", String(params.limit));
  }
  if (params.offset !== undefined) {
    url.searchParams.set("offset", String(params.offset));
  }
  if (params.type && params.type !== "all") {
    url.searchParams.set("type", params.type);
  }
  if (params.status) {
    url.searchParams.set("status", params.status);
  }
  if (params.timeframe) {
    url.searchParams.set("timeframe", params.timeframe);
  }
  if (params.from) {
    url.searchParams.set("from", params.from);
  }
  if (params.to) {
    url.searchParams.set("to", params.to);
  }
  if (params.sort) {
    url.searchParams.set("sort", params.sort);
  }

  return url.toString();
}

/**
 * Generic API request handler for transactions
 */
async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T | ApiError> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        error: "Unknown error",
        message: "An unexpected error occurred",
        statusCode: response.status,
      }));

      // Handle 401 - redirect to login
      if (response.status === 401 && typeof window !== "undefined") {
        TokenManager.clearAuthData();
        window.location.href = "/auth/login";
      }

      return errorData;
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === "AbortError") {
      return {
        error: "Request timeout",
        message: "Request timeout",
        statusCode: 408,
      };
    }

    return {
      error: "Unknown error",
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
      statusCode: 0,
    };
  }
}

/**
 * Get list of all transactions with filtering and pagination
 */
export async function getTransactions(
  params: TransactionListParams = {},
  token: string
): Promise<TransactionListResponse | ApiError> {
  const url = buildTransactionUrl(API_ENDPOINTS.TRANSACTIONS.LIST, params);

  return apiRequest<TransactionListResponse>(url, {
    method: "GET",
    headers: getAuthHeaders(token),
  });
}

/**
 * Get transactions for a specific pod
 */
export async function getTransactionsByPod(
  podId: string,
  params: TransactionListParams = {},
  token: string
): Promise<TransactionListResponse | ApiError> {
  const url = buildTransactionUrl(
    API_ENDPOINTS.TRANSACTIONS.BY_POD(podId),
    params
  );

  return apiRequest<TransactionListResponse>(url, {
    method: "GET",
    headers: getAuthHeaders(token),
  });
}

/**
 * Export all transactions as CSV
 */
export async function exportTransactions(
  params: TransactionListParams = {},
  token: string
): Promise<Blob | ApiError> {
  const url = buildTransactionUrl(API_ENDPOINTS.TRANSACTIONS.EXPORT, params);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // Longer timeout for exports

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        ...getAuthHeaders(token),
        Accept: "text/csv",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        error: "Export failed",
        message: "Failed to export transactions",
        statusCode: response.status,
      }));
      return errorData;
    }

    return await response.blob();
  } catch (error) {
    clearTimeout(timeoutId);

    return {
      error: "Export failed",
      message:
        error instanceof Error ? error.message : "Failed to export transactions",
      statusCode: 0,
    };
  }
}

/**
 * Export transactions for a specific pod as CSV
 */
export async function exportTransactionsByPod(
  podId: string,
  params: TransactionListParams = {},
  token: string
): Promise<Blob | ApiError> {
  const url = buildTransactionUrl(
    API_ENDPOINTS.TRANSACTIONS.EXPORT_BY_POD(podId),
    params
  );

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        ...getAuthHeaders(token),
        Accept: "text/csv",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        error: "Export failed",
        message: "Failed to export transactions",
        statusCode: response.status,
      }));
      return errorData;
    }

    return await response.blob();
  } catch (error) {
    clearTimeout(timeoutId);

    return {
      error: "Export failed",
      message:
        error instanceof Error ? error.message : "Failed to export transactions",
      statusCode: 0,
    };
  }
}

/**
 * Helper to download blob as file
 */
export function downloadBlobAsFile(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Check if response is an error
 */
export function isApiError(response: unknown): response is ApiError {
  return (
    typeof response === "object" &&
    response !== null &&
    "error" in response &&
    "statusCode" in response
  );
}

export const TransactionService = {
  getTransactions,
  getTransactionsByPod,
  exportTransactions,
  exportTransactionsByPod,
  downloadBlobAsFile,
  isApiError,
};
