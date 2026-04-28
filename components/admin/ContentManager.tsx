"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ContentStatus } from "@prisma/client";
import {
  AdminTableControls,
  AdminToast,
  getErrorMessage,
  useAdminToast,
} from "@/components/admin/AdminClientHelpers";

type ContentRow = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  body: string;
  seoTitle: string | null;
  seoDescription: string | null;
  status: ContentStatus;
  updatedAt: string;
};

const statusOptions = Object.values(ContentStatus);
const pageSize = 6;

export default function ContentManager({ entries }: { entries: ContentRow[] }) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const { toast, showToast } = useAdminToast();

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesQuery = [entry.slug, entry.title, entry.summary ?? "", entry.seoTitle ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(query.trim().toLowerCase());
      const matchesStatus = statusFilter === "ALL" || entry.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [entries, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedEntries = filteredEntries.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  async function createEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsCreating(true);

    const form = new FormData(event.currentTarget);
    const nextStatus = String(form.get("status") || ContentStatus.DRAFT) as ContentStatus;

    if (
      nextStatus === ContentStatus.PUBLISHED &&
      !window.confirm("Publish this new content entry immediately?")
    ) {
      setIsCreating(false);
      return;
    }

    const response = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: String(form.get("slug") || ""),
        title: String(form.get("title") || ""),
        summary: String(form.get("summary") || ""),
        body: String(form.get("body") || ""),
        seoTitle: String(form.get("seoTitle") || ""),
        seoDescription: String(form.get("seoDescription") || ""),
        status: nextStatus,
      }),
    });

    setIsCreating(false);

    if (!response.ok) {
      setError(await getErrorMessage(response, "Failed to create content entry."));
      showToast("Content creation failed.", "error");
      return;
    }

    event.currentTarget.reset();
    showToast("Content entry created successfully.");
    router.refresh();
  }

  async function updateEntry(payload: {
    contentId: string;
    title: string;
    summary: string;
    body: string;
    seoTitle: string;
    seoDescription: string;
    status: ContentStatus;
  }) {
    setError("");
    setPendingId(payload.contentId);

    const response = await fetch("/api/admin/content", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setPendingId(null);

    if (!response.ok) {
      setError(await getErrorMessage(response, "Failed to update content entry."));
      showToast("Content update failed.", "error");
      return;
    }

    showToast("Content entry updated successfully.");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <AdminToast toast={toast} />
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <h1 className="text-2xl font-black text-[#231F20] mb-4">Content Management</h1>
        <form onSubmit={createEntry} className="grid md:grid-cols-2 gap-3">
          <input name="slug" required placeholder="slug" className="rounded-md border border-gray-300 px-3 py-2" />
          <input name="title" required placeholder="title" className="rounded-md border border-gray-300 px-3 py-2" />
          <input name="summary" placeholder="summary" className="rounded-md border border-gray-300 px-3 py-2 md:col-span-2" />
          <textarea
            name="body"
            required
            rows={4}
            placeholder="body"
            className="rounded-md border border-gray-300 px-3 py-2 md:col-span-2"
          />
          <input name="seoTitle" placeholder="seo title" className="rounded-md border border-gray-300 px-3 py-2" />
          <input
            name="seoDescription"
            placeholder="seo description"
            className="rounded-md border border-gray-300 px-3 py-2"
          />
          <select name="status" className="rounded-md border border-gray-300 px-3 py-2 w-fit">
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button type="submit" disabled={isCreating} className="rounded-lg bg-[#00AEEF] text-white px-4 py-2 font-semibold w-fit">
            {isCreating ? "Creating..." : "Create Entry"}
          </button>
        </form>
        {error ? <p className="text-sm text-red-600 mt-3">{error}</p> : null}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <AdminTableControls
          query={query}
          onQueryChange={(value) => {
            setQuery(value);
            setPage(1);
          }}
          queryPlaceholder="Search by slug, title, summary, or SEO title"
          totalCount={filteredEntries.length}
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

      <div className="space-y-3">
        {paginatedEntries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
            No content entries matched the current search or filter.
          </div>
        ) : null}
        {paginatedEntries.map((entry) => {
          const isPending = pendingId === entry.id;
          return (
            <div key={entry.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
              <div className="grid md:grid-cols-2 gap-3">
                <input
                  id={`title-${entry.id}`}
                  defaultValue={entry.title}
                  className="rounded-md border border-gray-300 px-3 py-2"
                />
                <select
                  id={`status-${entry.id}`}
                  defaultValue={entry.status}
                  className="rounded-md border border-gray-300 px-3 py-2"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <input
                  id={`summary-${entry.id}`}
                  defaultValue={entry.summary ?? ""}
                  className="rounded-md border border-gray-300 px-3 py-2 md:col-span-2"
                />
                <textarea
                  id={`body-${entry.id}`}
                  defaultValue={entry.body}
                  rows={4}
                  className="rounded-md border border-gray-300 px-3 py-2 md:col-span-2"
                />
                <input
                  id={`seoTitle-${entry.id}`}
                  defaultValue={entry.seoTitle ?? ""}
                  className="rounded-md border border-gray-300 px-3 py-2"
                />
                <input
                  id={`seoDescription-${entry.id}`}
                  defaultValue={entry.seoDescription ?? ""}
                  className="rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-gray-500">/{entry.slug}</p>
                <button
                  type="button"
                  disabled={isPending}
                  className="rounded-lg bg-[#00AEEF] text-white px-3 py-2 font-semibold disabled:opacity-50"
                  onClick={() => {
                    const titleElement = document.getElementById(`title-${entry.id}`) as HTMLInputElement | null;
                    const statusElement = document.getElementById(`status-${entry.id}`) as
                      | HTMLSelectElement
                      | null;
                    const summaryElement = document.getElementById(`summary-${entry.id}`) as
                      | HTMLInputElement
                      | null;
                    const bodyElement = document.getElementById(`body-${entry.id}`) as HTMLTextAreaElement | null;
                    const seoTitleElement = document.getElementById(`seoTitle-${entry.id}`) as
                      | HTMLInputElement
                      | null;
                    const seoDescriptionElement = document.getElementById(`seoDescription-${entry.id}`) as
                      | HTMLInputElement
                      | null;

                    if (
                      !titleElement ||
                      !statusElement ||
                      !summaryElement ||
                      !bodyElement ||
                      !seoTitleElement ||
                      !seoDescriptionElement
                    ) {
                      return;
                    }

                    const nextStatus = statusElement.value as ContentStatus;

                    if (
                      entry.status !== nextStatus &&
                      (nextStatus === ContentStatus.PUBLISHED || nextStatus === ContentStatus.ARCHIVED) &&
                      !window.confirm(`Confirm content status change to ${nextStatus}?`)
                    ) {
                      return;
                    }

                    void updateEntry({
                      contentId: entry.id,
                      title: titleElement.value,
                      status: nextStatus,
                      summary: summaryElement.value,
                      body: bodyElement.value,
                      seoTitle: seoTitleElement.value,
                      seoDescription: seoDescriptionElement.value,
                    });
                  }}
                >
                  {isPending ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
