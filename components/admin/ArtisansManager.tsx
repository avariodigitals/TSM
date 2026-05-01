"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArtisanStatus } from "@prisma/client";
import {
  AdminTableControls,
  AdminToast,
  getErrorMessage,
  useAdminToast,
} from "@/components/admin/AdminClientHelpers";

type ArtisanRow = {
  id: string;
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  tradeCategory: string;
  citiesCovered: unknown;
  yearsExperience: string;
  certifications: string;
  profileDescription: string;
  consentGiven: boolean;
  status: ArtisanStatus;
  internalNotes: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const statusOptions = Object.values(ArtisanStatus);
const pageSize = 10;

export default function ArtisansManager({ artisans }: { artisans: ArtisanRow[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isBulkSaving, setIsBulkSaving] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedArtisanIds, setSelectedArtisanIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<ArtisanStatus | "">("");
  const [viewArtisan, setViewArtisan] = useState<ArtisanRow | null>(null);
  const [deletePendingId, setDeletePendingId] = useState<string | null>(null);
  const { toast, showToast } = useAdminToast();

  const filteredArtisans = useMemo(() => {
    return artisans.filter((artisan) => {
      const matchesQuery = [artisan.fullName, artisan.businessName, artisan.tradeCategory]
        .join(" ")
        .toLowerCase()
        .includes(query.trim().toLowerCase());
      const matchesStatus = statusFilter === "ALL" || artisan.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [artisans, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredArtisans.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedArtisans = filteredArtisans.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const allVisibleSelected = paginatedArtisans.length > 0 && paginatedArtisans.every((artisan) => selectedArtisanIds.includes(artisan.id));
  const selectedCount = selectedArtisanIds.length;

  async function updateArtisan(payload: { artisanId: string; status: ArtisanStatus; internalNotes: string }) {
    setError("");
    setPendingId(payload.artisanId);

    const response = await fetch("/api/admin/artisans", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setPendingId(null);

    if (!response.ok) {
      setError(await getErrorMessage(response, "Failed to update artisan."));
      showToast("Artisan update failed.", "error");
      return;
    }

    showToast("Artisan updated successfully.");
    router.refresh();
  }

  async function applyBulkStatus() {
    if (!bulkStatus || selectedArtisanIds.length === 0) {
      showToast("Select at least one artisan and a status.", "info");
      return;
    }

    if (!window.confirm(`Confirm status change to ${bulkStatus} for ${selectedArtisanIds.length} selected artisans?`)) {
      return;
    }

    setError("");
    setIsBulkSaving(true);

    const response = await fetch("/api/admin/artisans", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ artisanIds: selectedArtisanIds, status: bulkStatus }),
    });

    setIsBulkSaving(false);

    if (!response.ok) {
      setError(await getErrorMessage(response, "Failed to update selected artisans."));
      showToast("Bulk artisan update failed.", "error");
      return;
    }

    setSelectedArtisanIds([]);
    setBulkStatus("");
    showToast(`Updated ${selectedArtisanIds.length} artisan${selectedArtisanIds.length === 1 ? "" : "s"}.`);
    router.refresh();
  }

  async function deleteArtisan(artisan: ArtisanRow) {
    if (!window.confirm(`Delete artisan registration for ${artisan.fullName}? This cannot be undone.`)) {
      return;
    }

    setError("");
    setDeletePendingId(artisan.id);

    const response = await fetch("/api/admin/artisans", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ artisanId: artisan.id }),
    });

    setDeletePendingId(null);

    if (!response.ok) {
      setError(await getErrorMessage(response, "Failed to delete artisan."));
      showToast("Artisan delete failed.", "error");
      return;
    }

    setSelectedArtisanIds((current) => current.filter((id) => id !== artisan.id));
    if (viewArtisan?.id === artisan.id) {
      setViewArtisan(null);
    }
    showToast("Artisan deleted successfully.");
    router.refresh();
  }

  function toggleArtisanSelection(artisanId: string, checked: boolean) {
    setSelectedArtisanIds((current) => {
      if (checked) {
        return current.includes(artisanId) ? current : [...current, artisanId];
      }

      return current.filter((id) => id !== artisanId);
    });
  }

  function toggleVisibleSelection(checked: boolean) {
    const visibleIds = paginatedArtisans.map((artisan) => artisan.id);

    setSelectedArtisanIds((current) => {
      if (checked) {
        return Array.from(new Set([...current, ...visibleIds]));
      }

      return current.filter((id) => !visibleIds.includes(id));
    });
  }

  function formatCities(citiesCovered: unknown) {
    if (Array.isArray(citiesCovered)) {
      return citiesCovered.filter((city) => typeof city === "string").join(", ");
    }

    return "";
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <AdminToast toast={toast} />
      <div className="p-5 border-b border-gray-100">
        <h1 className="text-2xl font-black text-[#231F20]">Artisan Registrations</h1>
        {error ? <p className="text-sm text-red-600 mt-2">{error}</p> : null}
        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-gray-200 bg-[#F5F7FA] p-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#231F20]">Bulk artisan actions</p>
            <p className="text-sm text-gray-500">Approve, suspend, or reject multiple registrations together.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="space-y-1 text-sm font-medium text-[#231F20]">
              <span>Status</span>
              <select
                value={bulkStatus}
                onChange={(event) => setBulkStatus(event.target.value as ArtisanStatus | "")}
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
            queryPlaceholder="Search by name, business, or trade"
            totalCount={filteredArtisans.length}
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
                  aria-label="Select all visible artisans"
                />
              </th>
              <th className="p-3">Artisan</th>
              <th className="p-3">Trade</th>
              <th className="p-3">Experience</th>
              <th className="p-3">Status</th>
              <th className="p-3">Notes</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedArtisans.length === 0 ? (
              <tr>
                <td className="p-6 text-center text-sm text-gray-500" colSpan={7}>
                  No artisans matched the current search or filter.
                </td>
              </tr>
            ) : null}
            {paginatedArtisans.map((artisan) => {
              const isPending = pendingId === artisan.id;
              return (
                <tr key={artisan.id} className="border-t border-gray-100 align-top">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedArtisanIds.includes(artisan.id)}
                      onChange={(event) => toggleArtisanSelection(artisan.id, event.target.checked)}
                      aria-label={`Select ${artisan.fullName}`}
                    />
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-[#231F20]">{artisan.fullName}</div>
                    <div className="text-xs text-gray-500">{artisan.businessName}</div>
                    <div className="text-xs text-gray-400">{new Date(artisan.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="p-3">{artisan.tradeCategory}</td>
                  <td className="p-3">{artisan.yearsExperience}</td>
                  <td className="p-3">
                    <select
                      id={`status-${artisan.id}`}
                      defaultValue={artisan.status}
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
                    <textarea
                      id={`notes-${artisan.id}`}
                      defaultValue={artisan.internalNotes ?? ""}
                      rows={3}
                      className="w-72 rounded-md border border-gray-300 px-2 py-1"
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        className="rounded-lg border border-gray-300 px-3 py-2 font-semibold text-[#231F20] hover:bg-[#F5F7FA]"
                        onClick={() => setViewArtisan(artisan)}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        className="rounded-lg bg-[#00AEEF] text-white px-3 py-2 font-semibold disabled:opacity-50"
                        onClick={() => {
                          const statusElement = document.getElementById(`status-${artisan.id}`) as
                            | HTMLSelectElement
                            | null;
                          const notesElement = document.getElementById(`notes-${artisan.id}`) as
                            | HTMLTextAreaElement
                            | null;
                          if (!statusElement || !notesElement) return;

                          const nextStatus = statusElement.value as ArtisanStatus;

                          if (
                            artisan.status !== nextStatus &&
                            (nextStatus === ArtisanStatus.APPROVED ||
                              nextStatus === ArtisanStatus.SUSPENDED ||
                              nextStatus === ArtisanStatus.REJECTED) &&
                            !window.confirm(`Confirm artisan status change to ${nextStatus}?`)
                          ) {
                            return;
                          }

                          void updateArtisan({
                            artisanId: artisan.id,
                            status: nextStatus,
                            internalNotes: notesElement.value,
                          });
                        }}
                      >
                        {isPending ? "Saving..." : "Save"}
                      </button>
                      <button
                        type="button"
                        disabled={deletePendingId === artisan.id}
                        className="rounded-lg border border-red-200 px-3 py-2 font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                        onClick={() => void deleteArtisan(artisan)}
                      >
                        {deletePendingId === artisan.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {viewArtisan ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#231F20]/40 px-4 py-8">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-5">
              <div>
                <h2 className="text-xl font-black text-[#231F20]">{viewArtisan.fullName}</h2>
                <p className="text-sm text-gray-500">{viewArtisan.businessName} · {viewArtisan.tradeCategory}</p>
              </div>
              <button
                type="button"
                onClick={() => setViewArtisan(null)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-[#231F20]"
              >
                Close
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  ["Email", viewArtisan.email],
                  ["Phone", viewArtisan.phone],
                  ["Experience", viewArtisan.yearsExperience],
                  ["Status", viewArtisan.status],
                  ["Cities Covered", formatCities(viewArtisan.citiesCovered)],
                  ["Consent Given", viewArtisan.consentGiven ? "Yes" : "No"],
                  ["Created", new Date(viewArtisan.createdAt).toLocaleString()],
                  ["Approved", viewArtisan.approvedAt ? new Date(viewArtisan.approvedAt).toLocaleString() : "Not approved"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-[#F5F7FA] p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-400">{label}</p>
                    <p className="mt-1 text-sm font-semibold text-[#231F20] break-words">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl bg-[#F5F7FA] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Certifications</p>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600">{viewArtisan.certifications}</p>
              </div>
              <div className="mt-4 rounded-xl bg-[#F5F7FA] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Profile Description</p>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600">{viewArtisan.profileDescription}</p>
              </div>
              {viewArtisan.internalNotes ? (
                <div className="mt-4 rounded-xl bg-[#F5F7FA] p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Internal Notes</p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600">{viewArtisan.internalNotes}</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
