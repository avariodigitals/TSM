"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminToast,
  getErrorMessage,
  useAdminToast,
} from "@/components/admin/AdminClientHelpers";

type SettingRow = {
  id: string;
  key: string;
  value: unknown;
};

type PageHero = {
  title: string;
  subtitle: string;
};

type HomeHero = {
  badge: string;
  titlePrefix: string;
  titleHighlight: string;
  titleSuffix: string;
  subtitle: string;
  mediaMode?: "none" | "image" | "slides";
  mediaImageUrl?: string;
  mediaSlides?: string[];
};

const defaultPageHeroes: Record<string, PageHero> = {
  about: { title: "About Total Serve", subtitle: "UK-wide maintenance support, delivered with care and professionalism." },
  contact: { title: "Contact Us", subtitle: "Have a question or need help? Get in touch with the Total Serve team." },
  howItWorks: { title: "How Total Serve Works", subtitle: "We make finding trusted tradespeople simple." },
  services: { title: "Our Services", subtitle: "Browse all the trades and maintenance services Total Serve covers across the United Kingdom." },
  cities: { title: "Cities We Cover", subtitle: "Total Serve currently operates across these major UK cities. We are continually expanding our network." },
  faq: { title: "Frequently Asked Questions", subtitle: "Everything you need to know about submitting enquiries, our process, and joining as an artisan." },
  enquiry: { title: "Submit an Enquiry", subtitle: "Fill in the form below. Total Serve will review your request and match you with the right vetted professional for your job." },
  registerArtisan: { title: "Register as an Artisan", subtitle: "Join the Total Serve artisan network. Register your trade, get reviewed, and receive relevant job opportunities across the UK." },
};

const defaultHomeHero: HomeHero = {
  badge: "UK-Wide Maintenance Support",
  titlePrefix: "Find Trusted",
  titleHighlight: "Tradespeople",
  titleSuffix: "Across the UK",
  subtitle:
    "Submit an enquiry for your service and location. Total Serve reviews your request and assigns the right vetted professional — so you don't have to search alone.",
  mediaMode: "none",
  mediaImageUrl: "",
  mediaSlides: [],
};

const pageLabels: Record<string, string> = {
  about: "About",
  contact: "Contact",
  howItWorks: "How It Works",
  services: "Services",
  cities: "Cities",
  faq: "FAQ",
  enquiry: "Enquiry",
  registerArtisan: "Register Artisan",
};

export default function PageContentManager({ settings }: { settings: SettingRow[] }) {
  const router = useRouter();
  const { toast, showToast } = useAdminToast();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const initialState = useMemo(() => {
    const map = new Map(settings.map((row) => [row.key, row.value]));

    return {
      homeHero: map.get("content.homeHero") as HomeHero | undefined,
      pageHeroes: map.get("content.pageHeroes") as Record<string, PageHero> | undefined,
    };
  }, [settings]);

  const [homeHero, setHomeHero] = useState<HomeHero>(initialState.homeHero ?? defaultHomeHero);
  const [pageHeroes, setPageHeroes] = useState<Record<string, PageHero>>(initialState.pageHeroes ?? defaultPageHeroes);
  const [selectedPageKey, setSelectedPageKey] = useState(Object.keys(defaultPageHeroes)[0]);
  const [slidesDraft, setSlidesDraft] = useState((homeHero.mediaSlides ?? []).join("\n"));

  async function saveContent() {
    setError("");
    setIsSaving(true);

    const payloads = [
      {
        key: "content.homeHero",
        value: homeHero,
        description: "Homepage hero content controls",
      },
      {
        key: "content.pageHeroes",
        value: pageHeroes,
        description: "Top section content controls for all frontend pages",
      },
    ];

    try {
      for (const payload of payloads) {
        const response = await fetch("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(await getErrorMessage(response, "Failed to save page content."));
        }
      }

      showToast("Page content updated successfully.");
      router.refresh();
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Failed to save page content.";
      setError(message);
      showToast("Page content update failed.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <AdminToast toast={toast} />
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <h1 className="text-2xl font-black text-[#231F20]">All Pages Content</h1>
        <p className="mt-2 text-sm text-gray-500">Edit homepage hero and top hero copy for every major page from backend.</p>

        <div className="mt-5 space-y-4">
          <h2 className="text-lg font-black text-[#231F20]">Homepage Hero</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={homeHero.badge} onChange={(event) => setHomeHero((current) => ({ ...current, badge: event.target.value }))} placeholder="Badge" className="rounded-md border border-gray-300 px-3 py-2" />
            <input value={homeHero.titlePrefix} onChange={(event) => setHomeHero((current) => ({ ...current, titlePrefix: event.target.value }))} placeholder="Title prefix" className="rounded-md border border-gray-300 px-3 py-2" />
            <input value={homeHero.titleHighlight} onChange={(event) => setHomeHero((current) => ({ ...current, titleHighlight: event.target.value }))} placeholder="Title highlight" className="rounded-md border border-gray-300 px-3 py-2" />
            <input value={homeHero.titleSuffix} onChange={(event) => setHomeHero((current) => ({ ...current, titleSuffix: event.target.value }))} placeholder="Title suffix" className="rounded-md border border-gray-300 px-3 py-2" />
          </div>
          <textarea value={homeHero.subtitle} onChange={(event) => setHomeHero((current) => ({ ...current, subtitle: event.target.value }))} rows={3} placeholder="Homepage subtitle" className="w-full rounded-md border border-gray-300 px-3 py-2" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="space-y-1 text-sm font-medium text-[#231F20]">
              <span>Hero media mode</span>
              <select
                value={homeHero.mediaMode ?? "none"}
                onChange={(event) =>
                  setHomeHero((current) => ({
                    ...current,
                    mediaMode: event.target.value as HomeHero["mediaMode"],
                  }))
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="none">None</option>
                <option value="image">Single image</option>
                <option value="slides">Slides</option>
              </select>
            </label>
            <label className="space-y-1 text-sm font-medium text-[#231F20] md:col-span-2">
              <span>Hero image URL</span>
              <input
                value={homeHero.mediaImageUrl ?? ""}
                onChange={(event) => setHomeHero((current) => ({ ...current, mediaImageUrl: event.target.value }))}
                placeholder="/hero-banner.webp or https://..."
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </label>
          </div>

          <label className="space-y-1 text-sm font-medium text-[#231F20]">
            <span>Slide URLs (one per line)</span>
            <textarea
              value={slidesDraft}
              onChange={(event) => {
                const nextValue = event.target.value;
                setSlidesDraft(nextValue);
                setHomeHero((current) => ({
                  ...current,
                  mediaSlides: nextValue
                    .split("\n")
                    .map((line) => line.trim())
                    .filter(Boolean),
                }));
              }}
              rows={4}
              placeholder="/slide-1.webp\n/slide-2.webp"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </label>
        </div>

        <div className="mt-8 space-y-3">
          <h2 className="text-lg font-black text-[#231F20]">Page Hero Sections</h2>
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
            <div className="rounded-xl border border-gray-200 p-2 bg-[#F8FAF5]">
              {Object.keys(pageHeroes).map((key) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => setSelectedPageKey(key)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm font-semibold ${
                    selectedPageKey === key ? "bg-[#0f5c2f] text-white" : "text-[#1f2937] hover:bg-[#e7f2da]"
                  }`}
                >
                  {pageLabels[key] ?? key}
                </button>
              ))}
            </div>
            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                Editing: {pageLabels[selectedPageKey] ?? selectedPageKey}
              </p>
              <div className="space-y-2">
                <input
                  value={pageHeroes[selectedPageKey]?.title ?? ""}
                  onChange={(event) =>
                    setPageHeroes((current) => ({
                      ...current,
                      [selectedPageKey]: {
                        ...current[selectedPageKey],
                        title: event.target.value,
                      },
                    }))
                  }
                  placeholder="Page title"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
                <textarea
                  value={pageHeroes[selectedPageKey]?.subtitle ?? ""}
                  onChange={(event) =>
                    setPageHeroes((current) => ({
                      ...current,
                      [selectedPageKey]: {
                        ...current[selectedPageKey],
                        subtitle: event.target.value,
                      },
                    }))
                  }
                  rows={3}
                  placeholder="Page subtitle"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
            </div>
          </div>
        </div>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <button
          type="button"
          onClick={() => void saveContent()}
          disabled={isSaving}
          className="mt-6 rounded-lg bg-[#2E3192] px-4 py-2 font-semibold text-white disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Page Content"}
        </button>
      </div>
    </div>
  );
}
