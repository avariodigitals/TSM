"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AssignmentStatus } from "@prisma/client";
import {
  AdminTableControls,
  AdminToast,
  getErrorMessage,
  useAdminToast,
} from "@/components/admin/AdminClientHelpers";

type AssignmentRow = {
  id: string;
  status: AssignmentStatus;
  notes: string | null;
  createdAt: string;
  lead: {
    id: string;
    fullName: string;
    serviceNeeded: string;
    city: string;
  };
  artisan: {
    id: string;
    fullName: string;
  };
  assignedBy: {
    fullName: string;
  };
};

type LeadOption = {
  id: string;
  fullName: string;
  serviceNeeded: string;
  city: string;
};

type ArtisanOption = {
  id: string;
  fullName: string;
  tradeCategory: string;
};

const statusOptions = Object.values(AssignmentStatus);
const pageSize = 8;

export default function AssignmentsManager({
  assignments,
  leads,
  artisans,
}: {
  assignments: AssignmentRow[];
  leads: LeadOption[];
  artisans: ArtisanOption[];
}) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const { toast, showToast } = useAdminToast();

  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      const matchesQuery = [
        assignment.lead.fullName,
        assignment.lead.serviceNeeded,
        assignment.lead.city,
        assignment.artisan.fullName,
        assignment.assignedBy.fullName,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query.trim().toLowerCase());
      const matchesStatus = statusFilter === "ALL" || assignment.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [assignments, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredAssignments.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedAssignments = filteredAssignments.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  async function createAssignment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsCreating(true);

    const form = new FormData(event.currentTarget);

    if (!window.confirm("Create this artisan assignment and notify the artisan?")) {
      setIsCreating(false);
      return;
    }

    const response = await fetch("/api/admin/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leadId: String(form.get("leadId") || ""),
        artisanId: String(form.get("artisanId") || ""),
        notes: String(form.get("notes") || ""),
      }),
    });

    setIsCreating(false);

    if (!response.ok) {
      setError(await getErrorMessage(response, "Failed to create assignment."));
      showToast("Assignment creation failed.", "error");
      return;
    }

    event.currentTarget.reset();
    showToast("Assignment created and notification queued.");
    router.refresh();
  }

  async function updateAssignment(payload: { assignmentId: string; status: AssignmentStatus; notes: string }) {
    setError("");
    setPendingId(payload.assignmentId);

    const response = await fetch("/api/admin/assignments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setPendingId(null);

    if (!response.ok) {
      setError(await getErrorMessage(response, "Failed to update assignment."));
      showToast("Assignment update failed.", "error");
      return;
    }

    showToast("Assignment updated successfully.");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <AdminToast toast={toast} />
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <h1 className="text-2xl font-black text-[#231F20] mb-4">Artisan Placements</h1>
        <form onSubmit={createAssignment} className="grid md:grid-cols-4 gap-3 items-end">
          <label className="text-sm font-medium text-[#231F20] space-y-1">
            <span>Lead</span>
            <select name="leadId" required className="w-full rounded-md border border-gray-300 px-2 py-2">
              <option value="">Select lead</option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.fullName} - {lead.serviceNeeded} ({lead.city})
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-[#231F20] space-y-1">
            <span>Artisan</span>
            <select name="artisanId" required className="w-full rounded-md border border-gray-300 px-2 py-2">
              <option value="">Select artisan</option>
              {artisans.map((artisan) => (
                <option key={artisan.id} value={artisan.id}>
                  {artisan.fullName} ({artisan.tradeCategory})
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-[#231F20] space-y-1 md:col-span-2">
            <span>Notes</span>
            <input
              name="notes"
              type="text"
              placeholder="Dispatch notes"
              className="w-full rounded-md border border-gray-300 px-2 py-2"
            />
          </label>

          <button
            type="submit"
            disabled={isCreating}
            className="rounded-lg bg-[#00AEEF] text-white px-4 py-2 font-semibold w-fit"
          >
            {isCreating ? "Creating..." : "Create Assignment"}
          </button>
        </form>
        {error ? <p className="text-sm text-red-600 mt-3">{error}</p> : null}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <AdminTableControls
            query={query}
            onQueryChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            queryPlaceholder="Search by lead, service, city, artisan, or assignee"
            totalCount={filteredAssignments.length}
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
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F7FA] text-left">
              <tr>
                <th className="p-3">Lead</th>
                <th className="p-3">Artisan</th>
                <th className="p-3">Status</th>
                <th className="p-3">Notes</th>
                <th className="p-3">Assigned By</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAssignments.length === 0 ? (
                <tr>
                  <td className="p-6 text-center text-sm text-gray-500" colSpan={6}>
                    No assignments matched the current search or filter.
                  </td>
                </tr>
              ) : null}
              {paginatedAssignments.map((assignment) => {
                const isPending = pendingId === assignment.id;
                return (
                  <tr key={assignment.id} className="border-t border-gray-100 align-top">
                    <td className="p-3">
                      {assignment.lead.fullName} ({assignment.lead.serviceNeeded})
                      <div className="text-xs text-gray-500">{assignment.lead.city}</div>
                    </td>
                    <td className="p-3">{assignment.artisan.fullName}</td>
                    <td className="p-3">
                      <select
                        id={`status-${assignment.id}`}
                        defaultValue={assignment.status}
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
                        id={`notes-${assignment.id}`}
                        defaultValue={assignment.notes ?? ""}
                        rows={2}
                        className="w-60 rounded-md border border-gray-300 px-2 py-1"
                      />
                    </td>
                    <td className="p-3">{assignment.assignedBy.fullName}</td>
                    <td className="p-3">
                      <button
                        type="button"
                        disabled={isPending}
                        className="rounded-lg bg-[#00AEEF] text-white px-3 py-2 font-semibold disabled:opacity-50"
                        onClick={() => {
                          const statusElement = document.getElementById(`status-${assignment.id}`) as
                            | HTMLSelectElement
                            | null;
                          const notesElement = document.getElementById(`notes-${assignment.id}`) as
                            | HTMLTextAreaElement
                            | null;
                          if (!statusElement || !notesElement) return;

                          const nextStatus = statusElement.value as AssignmentStatus;

                          if (
                            assignment.status !== nextStatus &&
                            (nextStatus === AssignmentStatus.CANCELLED ||
                              nextStatus === AssignmentStatus.DECLINED ||
                              nextStatus === AssignmentStatus.COMPLETED) &&
                            !window.confirm(`Confirm assignment status change to ${nextStatus}?`)
                          ) {
                            return;
                          }

                          void updateAssignment({
                            assignmentId: assignment.id,
                            status: nextStatus,
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
    </div>
  );
}
