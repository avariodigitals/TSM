"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LeadStatus } from "@prisma/client";
import {
  AdminTableControls,
  AdminToast,
  getErrorMessage,
  useAdminToast,
} from "@/components/admin/AdminClientHelpers";

type LeadRow = {
  id: string;
  fullName: string;
  email: string;
  serviceNeeded: string;
  city: string;
  urgencyLevel: string;
  status: LeadStatus;
  notes: string | null;
  assignedArtisanId: string | null;
  assignedArtisan?: {
    fullName: string;
    businessName: string;
  } | null;
};

type ArtisanOption = {
  id: string;
  fullName: string;
  businessName: string;
  tradeCategory: string;
};

const statusOptions = Object.values(LeadStatus);
const pageSize = 10;

export default function LeadsManager({ leads, artisans }: { leads: LeadRow[]; artisans: ArtisanOption[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isBulkSaving, setIsBulkSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<LeadStatus | "">("");
  const { toast, showToast } = useAdminToast();

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesQuery = [lead.fullName, lead.email, lead.serviceNeeded, lead.city]
        .join(" ")
        .toLowerCase()
        .includes(query.trim().toLowerCase());
      const matchesStatus = statusFilter === "ALL" || lead.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [leads, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedLeads = filteredLeads.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const allVisibleSelected = paginatedLeads.length > 0 && paginatedLeads.every((lead) => selectedLeadIds.includes(lead.id));
  const selectedCount = selectedLeadIds.length;

  async function updateLead(payload: {
    leadId: string;
    status: LeadStatus;
    notes: string;
    assignedArtisanId: string | null;
  }) {
    setError("");
    setPendingId(payload.leadId);

    const response = await fetch("/api/admin/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setPendingId(null);

    if (!response.ok) {
      setError(await getErrorMessage(response, "Failed to update lead."));
      showToast("Lead update failed.", "error");
      return;
    }

    showToast("Lead updated successfully.");
    router.refresh();
  }

  async function applyBulkStatus() {
    if (!bulkStatus || selectedLeadIds.length === 0) {
      showToast("Select at least one lead and a status.", "info");
      return;
    }

    if (
      (bulkStatus === LeadStatus.CLOSED || bulkStatus === LeadStatus.COMPLETED) &&
      !window.confirm(`Confirm status change to ${bulkStatus} for ${selectedLeadIds.length} selected leads?`)
    ) {
      return;
    }

    setError("");
    setIsBulkSaving(true);

    const response = await fetch("/api/admin/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadIds: selectedLeadIds, status: bulkStatus }),
    });

    setIsBulkSaving(false);

    if (!response.ok) {
      setError(await getErrorMessage(response, "Failed to update selected leads."));
      showToast("Bulk lead update failed.", "error");
      return;
    }

    setSelectedLeadIds([]);
    setBulkStatus("");
    showToast(`Updated ${selectedLeadIds.length} lead${selectedLeadIds.length === 1 ? "" : "s"}.`);
    router.refresh();
  }

  function toggleLeadSelection(leadId: string, checked: boolean) {
    setSelectedLeadIds((current) => {
      if (checked) {
        return current.includes(leadId) ? current : [...current, leadId];
      }

      return current.filter((id) => id !== leadId);
    });
  }

  function toggleVisibleSelection(checked: boolean) {
    const visibleIds = paginatedLeads.map((lead) => lead.id);

    setSelectedLeadIds((current) => {
      if (checked) {
        return Array.from(new Set([...current, ...visibleIds]));
      }

      return current.filter((id) => !visibleIds.includes(id));
    });
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <AdminToast toast={toast} />
      <div className="p-5 border-b border-gray-100">
        <h1 className="text-2xl font-black text-[#231F20]">Enquiries / Leads</h1>
        {error ? <p className="text-sm text-red-600 mt-2">{error}</p> : null}
        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-gray-200 bg-[#F5F7FA] p-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#231F20]">Bulk lead actions</p>
            <p className="text-sm text-gray-500">Close or progress multiple enquiries at once.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="space-y-1 text-sm font-medium text-[#231F20]">
              <span>Status</span>
              <select
                value={bulkStatus}
                onChange={(event) => setBulkStatus(event.target.value as LeadStatus | "")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 sm:w-56"
              >
                <option value="">Select bulk status</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => void applyBulkStatus()}
              disabled={isBulkSaving || selectedCount === 0 || !bulkStatus}
              className="rounded-lg bg-[#2E3192] px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isBulkSaving ? "Applying..." : `Apply to ${selectedCount} selected`}
            </button>
          </div>
        </div>
        <div className="mt-4">
          <AdminTableControls
            query={query}
            onQueryChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            queryPlaceholder="Search by customer, email, service, or city"
            totalCount={filteredLeads.length}
            page={currentPage}
            totalPages={totalPages}
            onPageChange={(nextPage) => setPage(Math.max(1, Math.min(nextPage, totalPages)))}
            filterLabel="Status"
            filterValue={statusFilter}
            onFilterChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
            filterOptions={[{ label: "All statuses", value: "ALL" }, ...statusOptions.map((status) => ({ label: status, value: status }))]}
          />
        </div>
      </div>
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F5F7FA] text-left">
            <tr>
              <th className="p-3 w-12">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={(event) => toggleVisibleSelection(event.target.checked)}
                  aria-label="Select all visible leads"
                />
              </th>
              <th className="p-3">Customer</th>
              <th className="p-3">Service</th>
              <th className="p-3">City</th>
              <th className="p-3">Status</th>
              <th className="p-3">Assign</th>
              <th className="p-3">Notes</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLeads.length === 0 ? (
              <tr>
                <td className="p-6 text-center text-sm text-gray-500" colSpan={8}>
                  No leads matched the current search or filter.
                </td>
              </tr>
            ) : null}
            {paginatedLeads.map((lead) => {
              const isPending = pendingId === lead.id;
              return (
                <tr key={lead.id} className="border-t border-gray-100 align-top">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedLeadIds.includes(lead.id)}
                      onChange={(event) => toggleLeadSelection(lead.id, event.target.checked)}
                      aria-label={`Select ${lead.fullName}`}
                    />
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-[#231F20]">{lead.fullName}</div>
                    <div className="text-xs text-gray-500">{lead.email}</div>
                    <div className="text-xs text-gray-400">{lead.urgencyLevel}</div>
                  </td>
                  <td className="p-3">{lead.serviceNeeded}</td>
                  <td className="p-3">{lead.city}</td>
                  <td className="p-3">
                    <select
                      defaultValue={lead.status}
                      id={`status-${lead.id}`}
                      className="rounded-md border border-gray-300 px-2 py-1"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3">
                    <select
                      defaultValue={lead.assignedArtisanId ?? ""}
                      id={`artisan-${lead.id}`}
                      className="rounded-md border border-gray-300 px-2 py-1 min-w-52"
                    >
                      <option value="">Unassigned</option>
                      {artisans.map((artisan) => (
                        <option key={artisan.id} value={artisan.id}>
                          {artisan.fullName} ({artisan.tradeCategory})
                        </option>
                      ))}
                    </select>
                    {lead.assignedArtisan ? (
                      <p className="text-xs text-gray-500 mt-1">
                        Current: {lead.assignedArtisan.fullName} ({lead.assignedArtisan.businessName})
                      </p>
                    ) : null}
                  </td>
                  <td className="p-3">
                    <textarea
                      defaultValue={lead.notes ?? ""}
                      id={`notes-${lead.id}`}
                      rows={3}
                      className="w-64 rounded-md border border-gray-300 px-2 py-1"
                    />
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      disabled={isPending}
                      className="rounded-lg bg-[#00AEEF] text-white px-3 py-2 font-semibold disabled:opacity-50"
                      onClick={() => {
                        const statusElement = document.getElementById(`status-${lead.id}`) as HTMLSelectElement | null;
                        const artisanElement = document.getElementById(`artisan-${lead.id}`) as
                          | HTMLSelectElement
                          | null;
                        const notesElement = document.getElementById(`notes-${lead.id}`) as
                          | HTMLTextAreaElement
                          | null;

                        if (!statusElement || !artisanElement || !notesElement) return;

                        const nextStatus = statusElement.value as LeadStatus;
                        const nextArtisanId = artisanElement.value || null;

                        if (
                          (lead.assignedArtisanId !== nextArtisanId &&
                            !window.confirm("Confirm artisan assignment change for this lead?")) ||
                          (lead.status !== nextStatus &&
                            (nextStatus === LeadStatus.CLOSED || nextStatus === LeadStatus.COMPLETED) &&
                            !window.confirm(`Confirm status change to ${nextStatus}?`))
                        ) {
                          return;
                        }

                        void updateLead({
                          leadId: lead.id,
                          status: nextStatus,
                          assignedArtisanId: nextArtisanId,
                          notes: notesElement.value,
                        });
                      }}
                    >
                      {isPending ? "Saving..." : "Save"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
