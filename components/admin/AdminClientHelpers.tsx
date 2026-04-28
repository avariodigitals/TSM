"use client";

import { useEffect, useState } from "react";

type ToastTone = "success" | "error" | "info";

type ToastState = {
  id: number;
  message: string;
  tone: ToastTone;
};

type FilterOption = {
  label: string;
  value: string;
};

export function useAdminToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => {
      setToast(null);
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [toast]);

  function showToast(message: string, tone: ToastTone = "success") {
    setToast({ id: Date.now(), message, tone });
  }

  return { toast, showToast };
}

export function AdminToast({ toast }: { toast: ToastState | null }) {
  if (!toast) return null;

  const toneClasses = {
    success: "border-green-200 bg-green-50 text-green-800",
    error: "border-red-200 bg-red-50 text-red-700",
    info: "border-sky-200 bg-sky-50 text-sky-800",
  };

  return (
    <div className="fixed right-4 top-20 z-50 max-w-sm animate-[fade-in_0.2s_ease-out]">
      <div className={`rounded-xl border px-4 py-3 shadow-lg ${toneClasses[toast.tone]}`}>
        <p className="text-sm font-semibold">{toast.message}</p>
      </div>
    </div>
  );
}

export function AdminTableControls({
  query,
  onQueryChange,
  queryPlaceholder,
  totalCount,
  page,
  totalPages,
  onPageChange,
  filterLabel,
  filterValue,
  onFilterChange,
  filterOptions,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  queryPlaceholder: string;
  totalCount: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  filterLabel?: string;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: FilterOption[];
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="space-y-1 text-sm font-medium text-[#231F20]">
          <span>Search</span>
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={queryPlaceholder}
            className="w-full rounded-md border border-gray-300 px-3 py-2 sm:w-72"
          />
        </label>

        {filterOptions && onFilterChange ? (
          <label className="space-y-1 text-sm font-medium text-[#231F20]">
            <span>{filterLabel ?? "Filter"}</span>
            <select
              value={filterValue}
              onChange={(event) => onFilterChange(event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 sm:w-52"
            >
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
        <p className="text-sm text-gray-500">
          {totalCount} result{totalCount === 1 ? "" : "s"}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-[#231F20] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-[#231F20] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export async function getErrorMessage(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as { message?: string };
    return payload.message || fallback;
  } catch {
    return fallback;
  }
}
