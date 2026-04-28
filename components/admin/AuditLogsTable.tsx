"use client";

import { useMemo, useState } from "react";
import { AdminTableControls } from "@/components/admin/AdminClientHelpers";

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
  const [query, setQuery] = useState("");
  const [targetFilter, setTargetFilter] = useState("ALL");
  const [page, setPage] = useState(1);

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

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <h1 className="text-2xl font-black text-[#231F20]">Audit Trail</h1>
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
