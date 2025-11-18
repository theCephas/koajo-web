"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import cn from "clsx";
import Layout from "@/components2/usefull/Layout";
import Navigation from "@/components2/usefull/Navigation";
import Icon from "@/components2/usefull/Icon";
import Select from "@/components2/usefull/Select";
import Search from "@/components2/usefull/Search";
import Modal from "@/components2/usefull/Modal";
import Checkbox from "@/components2/Checkbox";
import { useDashboard } from "@/lib/provider-dashboard";
import { TokenManager } from "@/lib/utils/memory-manager";
import {
  TransactionService,
  isApiError,
} from "@/lib/services/transactionService";
import type {
  Transaction,
  TransactionListParams,
  TransactionTypeFilter,
  TransactionTimeframe,
  TransactionSortOrder,
  TransactionStatus,
  PodMembership,
} from "@/lib/types/api";
import { DASHBOARD_BREADCRUMBS } from "@/lib/constants/dashboard";

// Filter options
const typeOptions = [
  { title: "All Types", value: "all" },
  { title: "Payments", value: "payments" },
  { title: "Payouts", value: "payouts" },
];

const statusOptions = [
  { title: "All Status", value: "" },
  { title: "Succeeded", value: "succeeded" },
  { title: "Processing", value: "processing" },
  { title: "Pending", value: "pending" },
  { title: "Failed", value: "failed" },
  { title: "Canceled", value: "canceled" },
];

const timeframeOptions = [
  { title: "All Time", value: "" },
  { title: "Past", value: "past" },
  { title: "Upcoming", value: "upcoming" },
];

const sortOptions = [
  { title: "Newest First", value: "desc" },
  { title: "Oldest First", value: "asc" },
];

const limitOptions = [
  { title: "10 per page", value: "10" },
  { title: "25 per page", value: "25" },
  { title: "50 per page", value: "50" },
];

// Format currency
const formatCurrency = (
  amount: string | number,
  currency: string = "USD"
): string => {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(numAmount);
};

// Format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Format time
const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Status badge component
const StatusBadge = ({ status }: { status: TransactionStatus }) => {
  const statusConfig: Record<
    TransactionStatus,
    { bg: string; text: string; label: string }
  > = {
    succeeded: {
      bg: "bg-green-100",
      text: "text-green-700",
      label: "Succeeded",
    },
    processing: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      label: "Processing",
    },
    pending: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Pending" },
    failed: { bg: "bg-red-100", text: "text-red-700", label: "Failed" },
    canceled: { bg: "bg-gray-100", text: "text-gray-700", label: "Canceled" },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        config.bg,
        config.text
      )}
    >
      {config.label}
    </span>
  );
};

// Type badge component
const TypeBadge = ({ type }: { type: "payment" | "payout" }) => {
  const typeConfig = {
    payment: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      label: "Payment",
      icon: "arrow-up-right",
    },
    payout: {
      bg: "bg-purple-100",
      text: "text-purple-700",
      label: "Payout",
      icon: "arrow-down-left",
    },
  };

  const config = typeConfig[type];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
        config.bg,
        config.text
      )}
    >
      {config.label}
    </span>
  );
};

export default function TransactionsPage() {
  const { emailVerified, kycCompleted, pods, podsLoading } = useDashboard();
  const isLocked = !emailVerified || !kycCompleted;

  // State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TransactionTypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState("");
  const [timeframeFilter, setTimeframeFilter] = useState("");
  const [podFilter, setPodFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<TransactionSortOrder>("desc");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(25);

  // UI State
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [exportModal, setExportModal] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Pod options for filter
  const podOptions = useMemo(() => {
    const options = [{ title: "All Pods", value: "" }];
    if (pods && pods.length > 0) {
      pods.forEach((pod: PodMembership) => {
        options.push({
          title: `Pod ${pod.podId.slice(0, 8)}...`,
          value: pod.podId,
        });
      });
    }
    return options;
  }, [pods]);

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    const token = TokenManager.getToken();
    if (!token) return;

    setLoading(true);
    setError(null);

    const params: TransactionListParams = {
      limit,
      offset: (currentPage - 1) * limit,
      type: typeFilter,
      status: statusFilter || undefined,
      timeframe: (timeframeFilter as TransactionTimeframe) || undefined,
      sort: sortOrder,
      from: dateFrom || undefined,
      to: dateTo || undefined,
    };

    try {
      let response;
      if (podFilter) {
        response = await TransactionService.getTransactionsByPod(
          podFilter,
          params,
          token
        );
      } else {
        response = await TransactionService.getTransactions(params, token);
      }

      if (isApiError(response)) {
        setError(response.message as string);
        setTransactions([]);
        setTotalCount(0);
      } else {
        setTransactions(response.items);
        setTotalCount(response.total);
      }
    } catch (err) {
      setError("Failed to fetch transactions");
      setTransactions([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    limit,
    typeFilter,
    statusFilter,
    timeframeFilter,
    podFilter,
    sortOrder,
    dateFrom,
    dateTo,
  ]);

  // Fetch on filter changes
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    typeFilter,
    statusFilter,
    timeframeFilter,
    podFilter,
    sortOrder,
    dateFrom,
    dateTo,
    limit,
  ]);

  // Handle export
  const handleExport = async () => {
    const token = TokenManager.getToken();
    if (!token) return;

    setExporting(true);

    try {
      const params: TransactionListParams = {
        type: typeFilter,
        status: statusFilter || undefined,
        timeframe: (timeframeFilter as TransactionTimeframe) || undefined,
        sort: sortOrder,
        from: dateFrom || undefined,
        to: dateTo || undefined,
      };

      let response;
      if (podFilter) {
        response = await TransactionService.exportTransactionsByPod(
          podFilter,
          params,
          token
        );
      } else {
        response = await TransactionService.exportTransactions(params, token);
      }

      if (isApiError(response)) {
        setError(response.message as string);
      } else {
        const filename = `transactions_${
          new Date().toISOString().split("T")[0]
        }.csv`;
        TransactionService.downloadBlobAsFile(response, filename);
        setExportModal(false);
      }
    } catch (err) {
      setError("Failed to export transactions");
    } finally {
      setExporting(false);
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(transactions.map((t) => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Handle individual select
  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / limit);
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalCount);

  // Filter transactions by search (client-side)
  const filteredTransactions = useMemo(() => {
    if (!search) return transactions;
    const searchLower = search.toLowerCase();
    return transactions.filter(
      (t) =>
        t.id.toLowerCase().includes(searchLower) ||
        t.podName?.toLowerCase().includes(searchLower) ||
        t.stripeReference?.toLowerCase().includes(searchLower)
    );
  }, [transactions, search]);

  return (
    <Layout
      title="Transactions"
      breadcrumbs={DASHBOARD_BREADCRUMBS.TRANSACTIONS}
      head={<Navigation />}
    >
      <div className="flex flex-col gap-4">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          {/* Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  Transactions
                </h2>
                <span className="text-sm text-gray-500">
                  {totalCount} total
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Search
                  className="w-auto!"
                  classInput="!text-sm !h-9"
                  placeholder="Search transactions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onSubmit={(e) => e.preventDefault()}
                />

                <button
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 h-9 text-sm font-medium rounded-lg border transition-colors",
                    showFilters
                      ? "bg-gray-900 text-white border-gray-900 [&_svg]:fill-white"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  )}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Icon name="filter" size="16" />
                  Filters
                </button>

                <button
                  className="inline-flex items-center gap-1.5 px-3 h-9 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setExportModal(true)}
                >
                  <Icon name="export" size="16" />
                  Export
                </button>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  <Select
                    value={typeFilter}
                    onChange={(v) => setTypeFilter(v as TransactionTypeFilter)}
                    options={typeOptions}
                    small
                  />
                  <Select
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={statusOptions}
                    small
                  />
                  <Select
                    value={timeframeFilter}
                    onChange={setTimeframeFilter}
                    options={timeframeOptions}
                    small
                  />
                  <Select
                    value={podFilter}
                    onChange={setPodFilter}
                    options={podOptions}
                    small
                    disabled={podsLoading}
                  />
                  <Select
                    value={sortOrder}
                    onChange={(v) => setSortOrder(v as TransactionSortOrder)}
                    options={sortOptions}
                    small
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="h-9 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="From"
                  />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="h-9 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="To"
                  />
                </div>

                {/* Clear filters */}
                {(typeFilter !== "all" ||
                  statusFilter ||
                  timeframeFilter ||
                  podFilter ||
                  dateFrom ||
                  dateTo) && (
                  <button
                    className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    onClick={() => {
                      setTypeFilter("all");
                      setStatusFilter("");
                      setTimeframeFilter("");
                      setPodFilter("");
                      setDateFrom("");
                      setDateTo("");
                    }}
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Table */}
          <div
            className={cn(
              "overflow-x-auto",
              isLocked && "blur-sm select-none pointer-events-none"
            )}
          >
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="w-10 p-3">
                    <Checkbox
                      value={
                        selectedIds.length === filteredTransactions.length &&
                        filteredTransactions.length > 0
                          ? "checked"
                          : "unchecked"
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Pod
                  </th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="w-10 p-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  // Loading skeleton
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="p-3">
                        <div className="h-4 w-4 bg-gray-200 rounded" />
                      </td>
                      <td className="p-3">
                        <div className="h-4 w-32 bg-gray-200 rounded" />
                      </td>
                      <td className="p-3">
                        <div className="h-5 w-16 bg-gray-200 rounded-full" />
                      </td>
                      <td className="p-3">
                        <div className="h-4 w-20 bg-gray-200 rounded" />
                      </td>
                      <td className="p-3">
                        <div className="h-5 w-20 bg-gray-200 rounded-full" />
                      </td>
                      <td className="p-3">
                        <div className="h-4 w-24 bg-gray-200 rounded" />
                      </td>
                      <td className="p-3">
                        <div className="h-4 w-24 bg-gray-200 rounded" />
                      </td>
                      <td className="p-3">
                        <div className="h-4 w-4 bg-gray-200 rounded" />
                      </td>
                    </tr>
                  ))
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Icon
                          name="receipt"
                          size="32"
                          className="text-gray-300"
                        />
                        <p className="text-gray-500 font-medium">
                          No transactions found
                        </p>
                        <p className="text-sm text-gray-400">
                          {search || typeFilter !== "all" || statusFilter
                            ? "Try adjusting your filters"
                            : "Transactions will appear here once you make payments"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <>
                      <tr
                        key={transaction.id}
                        className={cn(
                          "hover:bg-gray-50 transition-colors cursor-pointer",
                          expandedId === transaction.id && "bg-gray-50"
                        )}
                        onClick={() =>
                          setExpandedId(
                            expandedId === transaction.id
                              ? null
                              : transaction.id
                          )
                        }
                      >
                        <td
                          className="p-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            value={
                              selectedIds.includes(transaction.id)
                                ? "checked"
                                : "unchecked"
                            }
                            onChange={() => handleSelect(transaction.id)}
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900 font-mono">
                              {transaction.id.slice(0, 12)}...
                            </span>
                            {transaction.stripeReference && (
                              <span className="text-xs text-gray-500 font-mono">
                                {transaction.stripeReference.slice(0, 16)}...
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <TypeBadge type={transaction.type} />
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span
                              className={cn(
                                "text-sm font-semibold",
                                transaction.type === "payment"
                                  ? "text-red-600"
                                  : "text-green-600"
                              )}
                            >
                              {transaction.type === "payment" ? "-" : "+"}
                              {formatCurrency(
                                transaction.amount,
                                transaction.currency
                              )}
                            </span>
                            {transaction.fee &&
                              parseFloat(transaction.fee) > 0 && (
                                <span className="text-xs text-gray-500">
                                  Fee:{" "}
                                  {formatCurrency(
                                    transaction.fee,
                                    transaction.currency
                                  )}
                                </span>
                              )}
                          </div>
                        </td>
                        <td className="p-3">
                          <StatusBadge status={transaction.status} />
                        </td>
                        <td className="p-3">
                          <span className="text-sm text-gray-600">
                            {transaction.podName ||
                              `${transaction.podId.slice(0, 8)}...`}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-900">
                              {formatDate(transaction.recordedAt)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatTime(transaction.recordedAt)}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                            <Icon
                              name={
                                expandedId === transaction.id
                                  ? "arrow-up"
                                  : "arrow-down"
                              }
                              size="16"
                              className="text-gray-400"
                            />
                          </button>
                        </td>
                      </tr>
                      {/* Expanded details */}
                      {expandedId === transaction.id && (
                        <tr className="bg-gray-50">
                          <td colSpan={8} className="p-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500 block mb-1">
                                  Transaction ID
                                </span>
                                <span className="font-mono text-gray-900">
                                  {transaction.id}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500 block mb-1">
                                  Membership ID
                                </span>
                                <span className="font-mono text-gray-900">
                                  {transaction.membershipId}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500 block mb-1">
                                  Pod ID
                                </span>
                                <span className="font-mono text-gray-900">
                                  {transaction.podId}
                                </span>
                              </div>
                              {transaction.stripeReference && (
                                <div>
                                  <span className="text-gray-500 block mb-1">
                                    Stripe Reference
                                  </span>
                                  <span className="font-mono text-gray-900">
                                    {transaction.stripeReference}
                                  </span>
                                </div>
                              )}
                              {transaction.description && (
                                <div className="col-span-2">
                                  <span className="text-gray-500 block mb-1">
                                    Description
                                  </span>
                                  <span className="text-gray-900">
                                    {transaction.description}
                                  </span>
                                </div>
                              )}
                              {transaction.podPlanCode && (
                                <div>
                                  <span className="text-gray-500 block mb-1">
                                    Pod Plan
                                  </span>
                                  <span className="text-gray-900">
                                    {transaction.podPlanCode}
                                  </span>
                                </div>
                              )}
                              {transaction.payoutDate && (
                                <div>
                                  <span className="text-gray-500 block mb-1">
                                    Payout Date
                                  </span>
                                  <span className="text-gray-900">
                                    {formatDate(transaction.payoutDate)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer with pagination */}
          {!loading && filteredTransactions.length > 0 && (
            <div className="p-4 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">
                    Showing {startItem} to {endItem} of {totalCount}{" "}
                    transactions
                  </span>
                  <Select
                    value={String(limit)}
                    onChange={(v) => setLimit(Number(v))}
                    options={limitOptions}
                    small
                  />
                </div>

                <div className="flex items-center gap-1">
                  <button
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <Icon
                      name="arrow-prev"
                      size="18"
                      className="text-gray-600"
                    />
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        className={cn(
                          "w-8 h-8 text-sm rounded-lg transition-colors",
                          currentPage === pageNum
                            ? "bg-gray-900 text-white"
                            : "hover:bg-gray-100 text-gray-600"
                        )}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    <Icon
                      name="arrow-next"
                      size="18"
                      className="text-gray-600"
                    />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error display */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>

      {/* Export Modal */}
      <Modal
        visible={exportModal}
        onClose={() => setExportModal(false)}
        className="max-w-md"
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Export Transactions
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Export your transactions to a CSV file. The export will include all
            transactions matching your current filters.
          </p>

          {(typeFilter !== "all" ||
            statusFilter ||
            timeframeFilter ||
            podFilter ||
            dateFrom ||
            dateTo) && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-2">Active filters:</p>
              <div className="flex flex-wrap gap-1">
                {typeFilter !== "all" && (
                  <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                    Type: {typeFilter}
                  </span>
                )}
                {statusFilter && (
                  <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                    Status: {statusFilter}
                  </span>
                )}
                {timeframeFilter && (
                  <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                    Timeframe: {timeframeFilter}
                  </span>
                )}
                {podFilter && (
                  <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                    Pod: {podFilter.slice(0, 8)}...
                  </span>
                )}
                {dateFrom && (
                  <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                    From: {dateFrom}
                  </span>
                )}
                {dateTo && (
                  <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                    To: {dateTo}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              onClick={() => setExportModal(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? "Exporting..." : "Export CSV"}
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
