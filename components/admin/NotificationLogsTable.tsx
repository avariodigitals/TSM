"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminTableControls,
  AdminToast,
  getErrorMessage,
  useAdminToast,
} from "@/components/admin/AdminClientHelpers";

type NotificationLogRow = {
  id: string;
  channel: string;
  recipient: string;
  subject: string;
  payload: unknown;
  status: string;
  error: string | null;
  createdAt: string;
};

const pageSize = 20;

export default function NotificationLogsTable({ logs }: { logs: NotificationLogRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [isClearing, setIsClearing] = useState(false);
  const [error, setError] = useState("");
  const { toast, showToast } = useAdminToast();

  const statuses = useMemo(() => {
    return Array.from(new Set(logs.map((log) => log.status))).sort();
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesQuery = [
        log.channel,
        log.recipient,
        log.subject,
        log.status,
        log.error ?? "",
        JSON.stringify(log.payload),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query.trim().toLowerCase());
      const matchesStatus = statusFilter === "ALL" || log.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [logs, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  async function clearLogs() {
    if (!window.confirm("Clear all notification delivery logs from the database? This cannot be undone.")) {
      return;
    }

    setError("");
    setIsClearing(true);

    const response = await fetch("/api/admin/notifications", { method: "DELETE" });

    setIsClearing(false);

    if (!response.ok) {
      setError(await getErrorMessage(response, "Failed to clear notification logs."));
      showToast("Notification log clear failed.", "error");
      return;
    }

    showToast("Notification logs cleared.");
    router.refresh();
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <AdminToast toast={toast} />
      <div className="p-5 border-b border-gray-100">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-black text-[#231F20]">Notification Delivery</h1>
          <button
            type="button"
            onClick={() => void clearLogs()}
            disabled={isClearing || logs.length === 0}
            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isClearing ? "Clearing..." : "Clear Logs"}
          </button>
        </div>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        <div className="mt-4">
          <AdminTableControls
            query={query}
            onQueryChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            queryPlaceholder="Search by recipient, subject, status, or payload"
            totalCount={filteredLogs.length}
            page={currentPage}
            totalPages={totalPages}
            onPageChange={(nextPage) => setPage(Math.max(1, Math.min(nextPage, totalPages)))}
            filterLabel="Status"
            filterValue={statusFilter}
            onFilterChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
            filterOptions={[{ label: "All statuses", value: "ALL" }, ...statuses.map((status) => ({ label: status, value: status }))]}
          />
        </div>
      </div>
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F5F7FA] text-left">
            <tr>
              <th className="p-3">When</th>
              <th className="p-3">Recipient</th>
              <th className="p-3">Subject</th>
              <th className="p-3">Status</th>
              <th className="p-3">Payload</th>
              <th className="p-3">Error</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLogs.length === 0 ? (
              <tr>
                <td className="p-6 text-center text-sm text-gray-500" colSpan={6}>
                  No notification logs matched the current search or filter.
                </td>
              </tr>
            ) : null}
            {paginatedLogs.map((log) => (
              <tr key={log.id} className="border-t border-gray-100 align-top">
                <td className="p-3 text-xs text-gray-600 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                <td className="p-3">
                  <div className="font-semibold text-[#231F20]">{log.recipient}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">{log.channel}</div>
                </td>
                <td className="p-3 max-w-sm break-words">{log.subject}</td>
                <td className="p-3">
                  <span className="inline-flex rounded-full bg-[#00AEEF]/10 px-2.5 py-1 text-xs font-semibold text-[#00AEEF]">
                    {log.status}
                  </span>
                </td>
                <td className="p-3 text-xs text-gray-600 max-w-md break-words">{JSON.stringify(log.payload) || "-"}</td>
                <td className="p-3 text-xs text-red-600 max-w-xs break-words">{log.error || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
