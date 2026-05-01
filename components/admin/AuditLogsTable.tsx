"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminTableControls,
  AdminToast,
  getErrorMessage,
  useAdminToast,
} from "@/components/admin/AdminClientHelpers";

type AuditLogRow = {
  id: string;
  action: string;
  targetType: string;
  targetId: string | null;
  metadata: unknown;
  createdAt: string;
  actor: {
    fullName: string;
    email: string;
  };
};

const pageSize = 20;

export default function AuditLogsTable({ logs }: { logs: AuditLogRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [targetFilter, setTargetFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [isClearing, setIsClearing] = useState(false);
  const [error, setError] = useState("");
  const { toast, showToast } = useAdminToast();

  const targetTypes = useMemo(() => {
    return Array.from(new Set(logs.map((log) => log.targetType))).sort();
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesQuery = [
        log.actor.fullName,
        log.actor.email,
        log.action,
        log.targetType,
        log.targetId ?? "",
        JSON.stringify(log.metadata),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query.trim().toLowerCase());
      const matchesTarget = targetFilter === "ALL" || log.targetType === targetFilter;
      return matchesQuery && matchesTarget;
    });
  }, [logs, query, targetFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  async function clearLogs() {
    if (!window.confirm("Clear the full audit trail from the database? Download a backup first if you need a copy.")) {
      return;
    }

    setError("");
    setIsClearing(true);

    const response = await fetch("/api/admin/audit-logs", { method: "DELETE" });

    setIsClearing(false);

    if (!response.ok) {
      setError(await getErrorMessage(response, "Failed to clear audit trail."));
      showToast("Audit trail clear failed.", "error");
      return;
    }

    showToast("Audit trail cleared.");
    router.refresh();
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <AdminToast toast={toast} />
      <div className="p-5 border-b border-gray-100">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-black text-[#231F20]">Audit Trail</h1>
          <div className="flex flex-wrap gap-2">
            <a
              href="/api/admin/audit-logs?format=csv"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-[#231F20] hover:bg-[#F5F7FA]"
            >
              Download CSV
            </a>
            <button
              type="button"
              onClick={() => void clearLogs()}
              disabled={isClearing || logs.length === 0}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isClearing ? "Clearing..." : "Clear Logs"}
            </button>
          </div>
        </div>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        <div className="mt-4">
          <AdminTableControls
            query={query}
            onQueryChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            queryPlaceholder="Search by actor, action, target, or metadata"
            totalCount={filteredLogs.length}
            page={currentPage}
            totalPages={totalPages}
            onPageChange={(nextPage) => setPage(Math.max(1, Math.min(nextPage, totalPages)))}
            filterLabel="Target type"
            filterValue={targetFilter}
            onFilterChange={(value) => {
              setTargetFilter(value);
              setPage(1);
            }}
            filterOptions={[{ label: "All targets", value: "ALL" }, ...targetTypes.map((type) => ({ label: type, value: type }))]}
          />
        </div>
      </div>
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F5F7FA] text-left">
            <tr>
              <th className="p-3">When</th>
              <th className="p-3">Actor</th>
              <th className="p-3">Action</th>
              <th className="p-3">Target</th>
              <th className="p-3">Metadata</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLogs.length === 0 ? (
              <tr>
                <td className="p-6 text-center text-sm text-gray-500" colSpan={5}>
                  No audit logs matched the current search or filter.
                </td>
              </tr>
            ) : null}
            {paginatedLogs.map((log) => (
              <tr key={log.id} className="border-t border-gray-100 align-top">
                <td className="p-3 text-xs text-gray-600">{new Date(log.createdAt).toLocaleString()}</td>
                <td className="p-3">
                  <div className="font-semibold text-[#231F20]">{log.actor.fullName}</div>
                  <div className="text-xs text-gray-500">{log.actor.email}</div>
                </td>
                <td className="p-3">{log.action}</td>
                <td className="p-3">
                  {log.targetType}
                  {log.targetId ? <div className="text-xs text-gray-500">{log.targetId}</div> : null}
                </td>
                <td className="p-3 text-xs text-gray-600 max-w-md break-words">{JSON.stringify(log.metadata) || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
