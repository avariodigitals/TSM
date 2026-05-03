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

type HomeSections = {
  services: { badge: string; title: string; subtitle: string; buttonLabel: string };
  cities: { badge: string; title: string; subtitle: string };
  howItWorks: { badge: string; title: string; subtitle: string };
  trust: { badge: string; title: string; subtitle: string };
  emergencyCta: { heading: string; subtext: string };
  enquiryCta: { heading: string; subtext: string };
  artisanCta: { heading: string; subtext: string };
  blog: { badge: string; title: string; subtitle: string; buttonLabel: string };
  faq: { badge: string; title: string; subtitle: string; buttonLabel: string };
};

const defaultPageHeroes: Record<string, PageHero> = {
  about: { title: "About Total Serve", subtitle: "UK-wide maintenance support, delivered with care and professionalism." },
  contact: { title: "Contact Us", subtitle: "Have a question or need help? Get in touch with the Total Serve team." },
  howItWorks: { title: "How Total Serve Works", subtitle: "We make finding trusted tradespeople simple." },
  services: { title: "Our Services", subtitle: "Browse all the trades and maintenance services Total Serve covers across the United Kingdom." },
  cities: { title: "Cities We Cover", subtitle: "Total Serve currently operates across these major UK cities. We are continually expanding our network." },
  faq: { title: "Frequently Asked Questions", subtitle: "Everything you need to know about submitting enquiries, our process, and joining as an artisan." },
  blog: { title: "Total Serve Blog", subtitle: "Practical maintenance advice, trade insights, and updates from the Total Serve team." },
  privacy: { title: "Privacy Policy", subtitle: "How Total Serve handles personal information when you use our website and services." },
  terms: { title: "Terms of Use", subtitle: "The terms that apply when you access Total Serve Maintenance Ltd online services." },
  cookies: { title: "Cookie Policy", subtitle: "How cookies and similar technologies may be used on the Total Serve website." },
  enquiry: { title: "Submit an Enquiry", subtitle: "Fill in the form below. Total Serve will review your request and match you with the right vetted professional for your job." },
  registerArtisan: { title: "Register as an Artisan", subtitle: "Join the Total Serve artisan network. Register your trade, get reviewed, and receive relevant job opportunities across the UK." },
  search: { title: "Search Results", subtitle: "Find trusted professionals by service and city, then submit your enquiry in seconds." },
  cityDetail: { title: "Tradespeople in {city}", subtitle: "Browse available services in your city and submit an enquiry for fast matching." },
  serviceDetail: { title: "{service} Services", subtitle: "View common jobs we handle and discover cities where this service is available." },
  serviceCity: { title: "{service} in {city}", subtitle: "Total Serve matches your request with vetted local professionals for this service." },
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

const defaultHomeSections: HomeSections = {
  services: {
    badge: "What We Cover",
    title: "Popular Services",
    subtitle: "From emergency repairs to planned maintenance, browse the trades we cover across the UK.",
    buttonLabel: "View All Services",
  },
  cities: {
    badge: "UK Coverage",
    title: "Browse by City",
    subtitle: "We currently serve these major UK cities with more being added regularly.",
  },
  howItWorks: {
    badge: "Simple Process",
    title: "How Total Serve Works",
    subtitle: "No directory browsing. No cold calls. We handle the matching so you get the right person for the job.",
  },
  trust: {
    badge: "Why Total Serve",
    title: "Why Choose Total Serve?",
    subtitle: "We're not a directory. We're a service - handling the hard work of finding the right tradesperson for you.",
  },
  emergencyCta: {
    heading: "Urgent Maintenance Issue?",
    subtext: "For emergency or time-sensitive requests, mark your enquiry as urgent and we'll prioritise it.",
  },
  enquiryCta: {
    heading: "Ready to Get Started?",
    subtext: "Submit an enquiry and let Total Serve find the right professional for you.",
  },
  artisanCta: {
    heading: "Join the Total Serve Network",
    subtext: "Register your trade and get access to relevant job opportunities across the UK.",
  },
  blog: {
    badge: "Latest Insights",
    title: "From the Totalserve Blog",
    subtitle: "Maintenance guidance, practical trade advice, and updates from our team.",
    buttonLabel: "View All Articles",
  },
  faq: {
    badge: "Common Questions",
    title: "Frequently Asked Questions",
    subtitle: "Everything you need to know about how Total Serve works.",
    buttonLabel: "View All FAQs",
  },
};

const pageLabels: Record<string, string> = {
  about: "About",
  contact: "Contact",
  howItWorks: "How It Works",
  services: "Services",
  cities: "Cities",
  faq: "FAQ",
  blog: "Blog",
  privacy: "Privacy Policy",
  terms: "Terms of Use",
  cookies: "Cookie Policy",
  enquiry: "Enquiry",
  registerArtisan: "Register Artisan",
  search: "Search",
  cityDetail: "City Detail",
  serviceDetail: "Service Detail",
  serviceCity: "Service + City",
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
      homeSections: map.get("content.homeSections") as HomeSections | undefined,
      pageHeroes: map.get("content.pageHeroes") as Record<string, PageHero> | undefined,
    };
  }, [settings]);

  const [homeHero, setHomeHero] = useState<HomeHero>(initialState.homeHero ?? defaultHomeHero);
  const [homeSections, setHomeSections] = useState<HomeSections>({
    ...defaultHomeSections,
    ...(initialState.homeSections ?? {}),
    services: { ...defaultHomeSections.services, ...(initialState.homeSections?.services ?? {}) },
    cities: { ...defaultHomeSections.cities, ...(initialState.homeSections?.cities ?? {}) },
    howItWorks: { ...defaultHomeSections.howItWorks, ...(initialState.homeSections?.howItWorks ?? {}) },
    trust: { ...defaultHomeSections.trust, ...(initialState.homeSections?.trust ?? {}) },
    emergencyCta: { ...defaultHomeSections.emergencyCta, ...(initialState.homeSections?.emergencyCta ?? {}) },
    enquiryCta: { ...defaultHomeSections.enquiryCta, ...(initialState.homeSections?.enquiryCta ?? {}) },
    artisanCta: { ...defaultHomeSections.artisanCta, ...(initialState.homeSections?.artisanCta ?? {}) },
    blog: { ...defaultHomeSections.blog, ...(initialState.homeSections?.blog ?? {}) },
    faq: { ...defaultHomeSections.faq, ...(initialState.homeSections?.faq ?? {}) },
  });
  const [pageHeroes, setPageHeroes] = useState<Record<string, PageHero>>({
    ...defaultPageHeroes,
    ...(initialState.pageHeroes ?? {}),
  });
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
        key: "content.homeSections",
        value: homeSections,
        description: "Homepage section-level content controls",
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

  function updatePageHeroField(pageKey: string, field: keyof PageHero, value: string) {
    setPageHeroes((current) => ({
      ...current,
      [pageKey]: {
        ...(current[pageKey] ?? { title: "", subtitle: "" }),
        [field]: value,
      },
    }));
  }

  return (
    <div className="space-y-5">
      <AdminToast toast={toast} />
      <div className="bg-white border border-[#d6dcff] rounded-2xl shadow-sm p-5">
        <h1 className="text-2xl font-black text-[#2E3192]">Pages Content</h1>
        <p className="mt-2 text-sm text-[#5b6280]">Edit homepage and every route-level hero section from one place.</p>

        <div className="mt-5 space-y-4">
          <h2 className="text-lg font-black text-[#2E3192]">Homepage Hero</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={homeHero.badge} onChange={(event) => setHomeHero((current) => ({ ...current, badge: event.target.value }))} placeholder="Badge" className="rounded-md border border-[#d6dcff] px-3 py-2" />
            <input value={homeHero.titlePrefix} onChange={(event) => setHomeHero((current) => ({ ...current, titlePrefix: event.target.value }))} placeholder="Title prefix" className="rounded-md border border-[#d6dcff] px-3 py-2" />
            <input value={homeHero.titleHighlight} onChange={(event) => setHomeHero((current) => ({ ...current, titleHighlight: event.target.value }))} placeholder="Title highlight" className="rounded-md border border-[#d6dcff] px-3 py-2" />
            <input value={homeHero.titleSuffix} onChange={(event) => setHomeHero((current) => ({ ...current, titleSuffix: event.target.value }))} placeholder="Title suffix" className="rounded-md border border-[#d6dcff] px-3 py-2" />
          </div>
          <textarea value={homeHero.subtitle} onChange={(event) => setHomeHero((current) => ({ ...current, subtitle: event.target.value }))} rows={3} placeholder="Homepage subtitle" className="w-full rounded-md border border-[#d6dcff] px-3 py-2" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="space-y-1 text-sm font-medium text-[#2d3554]">
              <span>Hero media mode</span>
              <select
                value={homeHero.mediaMode ?? "none"}
                onChange={(event) =>
                  setHomeHero((current) => ({
                    ...current,
                    mediaMode: event.target.value as HomeHero["mediaMode"],
                  }))
                }
                className="w-full rounded-md border border-[#d6dcff] px-3 py-2"
              >
                <option value="none">None</option>
                <option value="image">Single image</option>
                <option value="slides">Slides</option>
              </select>
            </label>
            <label className="space-y-1 text-sm font-medium text-[#2d3554] md:col-span-2">
              <span>Hero image URL</span>
              <input
                value={homeHero.mediaImageUrl ?? ""}
                onChange={(event) => setHomeHero((current) => ({ ...current, mediaImageUrl: event.target.value }))}
                placeholder="/hero-banner.webp or https://..."
                className="w-full rounded-md border border-[#d6dcff] px-3 py-2"
              />
            </label>
          </div>

          <label className="space-y-1 text-sm font-medium text-[#2d3554]">
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
              className="w-full rounded-md border border-[#d6dcff] px-3 py-2"
            />
          </label>
        </div>

        <div className="mt-8 space-y-3">
          <h2 className="text-lg font-black text-[#2E3192]">Homepage Sections</h2>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="rounded-xl border border-[#d6dcff] bg-[#f7f8ff] p-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-[#59608a]">Popular Services</p>
              <input value={homeSections.services.badge} onChange={(event) => setHomeSections((current) => ({ ...current, services: { ...current.services, badge: event.target.value } }))} placeholder="Badge" className="w-full rounded-md border border-[#d6dcff] bg-white px-3 py-2" />
              <input value={homeSections.services.title} onChange={(event) => setHomeSections((current) => ({ ...current, services: { ...current.services, title: event.target.value } }))} placeholder="Title" className="w-full rounded-md border border-[#d6dcff] bg-white px-3 py-2" />
              <textarea value={homeSections.services.subtitle} onChange={(event) => setHomeSections((current) => ({ ...current, services: { ...current.services, subtitle: event.target.value } }))} rows={3} placeholder="Subtitle" className="w-full rounded-md border border-[#d6dcff] bg-white px-3 py-2" />
              <input value={homeSections.services.buttonLabel} onChange={(event) => setHomeSections((current) => ({ ...current, services: { ...current.services, buttonLabel: event.target.value } }))} placeholder="Button label" className="w-full rounded-md border border-[#d6dcff] bg-white px-3 py-2" />
            </div>

            <div className="rounded-xl border border-[#d6dcff] bg-[#f7f8ff] p-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-[#59608a]">Browse by City</p>
              <input value={homeSections.cities.badge} onChange={(event) => setHomeSections((current) => ({ ...current, cities: { ...current.cities, badge: event.target.value } }))} placeholder="Badge" className="w-full rounded-md border border-[#d6dcff] bg-white px-3 py-2" />
              <input value={homeSections.cities.title} onChange={(event) => setHomeSections((current) => ({ ...current, cities: { ...current.cities, title: event.target.value } }))} placeholder="Title" className="w-full rounded-md border border-[#d6dcff] bg-white px-3 py-2" />
              <textarea value={homeSections.cities.subtitle} onChange={(event) => setHomeSections((current) => ({ ...current, cities: { ...current.cities, subtitle: event.target.value } }))} rows={3} placeholder="Subtitle" className="w-full rounded-md border border-[#d6dcff] bg-white px-3 py-2" />
            </div>

            <div className="rounded-xl border border-[#d6dcff] bg-[#f7f8ff] p-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-[#59608a]">How It Works</p>
              <input value={homeSections.howItWorks.badge} onChange={(event) => setHomeSections((current) => ({ ...current, howItWorks: { ...current.howItWorks, badge: event.target.value } }))} placeholder="Badge" className="w-full rounded-md border border-[#d6dcff] bg-white px-3 py-2" />
              <input value={homeSections.howItWorks.title} onChange={(event) => setHomeSections((current) => ({ ...current, howItWorks: { ...current.howItWorks, title: event.target.value } }))} placeholder="Title" className="w-full rounded-md border border-[#d6dcff] bg-white px-3 py-2" />
              <textarea value={homeSections.howItWorks.subtitle} onChange={(event) => setHomeSections((current) => ({ ...current, howItWorks: { ...current.howItWorks, subtitle: event.target.value } }))} rows={3} placeholder="Subtitle" className="w-full rounded-md border border-[#d6dcff] bg-white px-3 py-2" />
            </div>

            <div className="rounded-xl border border-[#d6dcff] bg-[#f7f8ff] p-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-[#59608a]">Why Choose Total Serve</p>
              <input value={homeSections.trust.badge} onChange={(event) => setHomeSections((current) => ({ ...current, trust: { ...current.trust, badge: event.target.value } }))} placeholder="Badge" className="w-full rounded-md border border-[#d6dcff] bg-white px-3 py-2" />
              <input value={homeSections.trust.title} onChange={(event) => setHomeSections((current) => ({ ...current, trust: { ...current.trust, title: event.target.value } }))} placeholder="Title" className="w-full rounded-md border border-[#d6dcff] bg-white px-3 py-2" />
              <textarea value={homeSections.trust.subtitle} onChange={(event) => setHomeSections((current) => ({ ...current, trust: { ...current.trust, subtitle: event.target.value } }))} rows={3} placeholder="Subtitle" className="w-full rounded-md border border-[#d6dcff] bg-white px-3 py-2" />
            </div>

            <div className="rounded-xl border border-[#d6dcff] bg-[#f7f8ff] p-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-[#59608a]">Emergency CTA</p>
              <input value={homeSections.emergencyCta.heading} onChange={(event) => setHomeSections((current) => ({ ...current, emergencyCta: { ...current.emergencyCta, heading: event.target.value } }))} placeholder="Heading" className="w-full rounded-md border border-[#d6dcff] bg-white px-3 py-2" />
              <textarea value={homeSections.emergencyCta.subtext} onChange={(event) => setHomeSections((current) => ({ ...current, emergencyCta: { ...current.emergencyCta, subtext: event.target.value } }))} rows={3} placeholder="Subtext" className="w-full rounded-md border border-[#d6dcff] bg-white px-3 py-2" />
            </div>

            <div className="rounded-xl border border-[#d6dcff] bg-[#f7f8ff] p-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-[#59608a]">Enquiry CTA</p>
              <input value={homeSections.enquiryCta.heading} onChange={(event) => setHomeSections((current) => ({ ...current, enquiryCta: { ...current.enquiryCta, heading: event.target.value } }))} placeholder="Heading" className="w-full rounded-md border border-[#d6dcff] bg-white px-3 py-2" />
              <textarea value={homeSections.enquiryCta.subtext} onChange={(event) => setHomeSections((current) => ({ ...current, enquiryCta: { ...current.enquiryCta, subtext: event.target.value } }))} rows={3} placeholder="Subtext" className="w-full rounded-md border border-[#d6dcff] bg-white px-3 py-2" />
            </div>

            <div className="rounded-xl border border-[#d6dcff] bg-[#f7f8ff] p-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-[#59608a]">Artisan CTA</p>
              <input value={homeSections.artisanCta.heading} onChange={(event) => setHomeSections((current) => ({ ...current, artisanCta: { ...current.artisanCta, heading: event.target.value } }))} placeholder="Heading" className="w-full rounded-md border border-[#d6dcff] bg-white px-3 py-2" />
              <textarea value={homeSections.artisanCta.subtext} onChange={(event) => setHomeSections((current) => ({ ...current, artisanCta: { ...current.artisanCta, subtext: event.target.value } }))} rows={3} placeholder="Subtext" className="w-full rounded-md border border-[#d6dcff] bg-white px-3 py-2" />
            </div>

            <div className="rounded-xl border border-[#d6dcff] bg-[#f7f8ff] p-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-[#59608a]">Homepage Blog</p>
              <input value={homeSections.blog.badge} onChange={(event) => setHomeSections((current) => ({ ...current, blog: { ...current.blog, badge: event.target.value } }))} placeholder="Badge" className="w-full rounded-md border border-[#d6dcff] bg-white px-3 py-2" />
              <input value={homeSections.blog.title} onChange={(event) => setHomeSections((current) => ({ ...current, blog: { ...current.blog, title: event.target.value } }))} placeholder="Title" className="w-full rounded-md border border-[#d6dcff] bg-white px-3 py-2" />
              <textarea value={homeSections.blog.subtitle} onChange={(event) => setHomeSections((current) => ({ ...current, blog: { ...current.blog, subtitle: event.target.value } }))} rows={3} placeholder="Subtitle" className="w-full rounded-md border border-[#d6dcff] bg-white px-3 py-2" />
              <input value={homeSections.blog.buttonLabel} onChange={(event) => setHomeSections((current) => ({ ...current, blog: { ...current.blog, buttonLabel: event.target.value } }))} placeholder="Button label" className="w-full rounded-md border border-[#d6dcff] bg-white px-3 py-2" />
            </div>

            <div className="rounded-xl border border-[#d6dcff] bg-[#f7f8ff] p-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-[#59608a]">Homepage FAQ</p>
              <input value={homeSections.faq.badge} onChange={(event) => setHomeSections((current) => ({ ...current, faq: { ...current.faq, badge: event.target.value } }))} placeholder="Badge" className="w-full rounded-md border border-[#d6dcff] bg-white px-3 py-2" />
              <input value={homeSections.faq.title} onChange={(event) => setHomeSections((current) => ({ ...current, faq: { ...current.faq, title: event.target.value } }))} placeholder="Title" className="w-full rounded-md border border-[#d6dcff] bg-white px-3 py-2" />
              <textarea value={homeSections.faq.subtitle} onChange={(event) => setHomeSections((current) => ({ ...current, faq: { ...current.faq, subtitle: event.target.value } }))} rows={3} placeholder="Subtitle" className="w-full rounded-md border border-[#d6dcff] bg-white px-3 py-2" />
              <input value={homeSections.faq.buttonLabel} onChange={(event) => setHomeSections((current) => ({ ...current, faq: { ...current.faq, buttonLabel: event.target.value } }))} placeholder="Button label" className="w-full rounded-md border border-[#d6dcff] bg-white px-3 py-2" />
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <h2 className="text-lg font-black text-[#2E3192]">Pages</h2>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {Object.keys(pageHeroes).map((key) => (
              <div key={key} className="rounded-xl border border-[#d6dcff] bg-[#f7f8ff] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[#59608a] mb-2">{pageLabels[key] ?? key}</p>
                <div className="space-y-2">
                  <input
                    value={pageHeroes[key]?.title ?? ""}
                    onChange={(event) => updatePageHeroField(key, "title", event.target.value)}
                    placeholder="Page title"
                    className="w-full rounded-md border border-[#d6dcff] bg-white px-3 py-2"
                  />
                  <textarea
                    value={pageHeroes[key]?.subtitle ?? ""}
                    onChange={(event) => updatePageHeroField(key, "subtitle", event.target.value)}
                    rows={3}
                    placeholder="Page subtitle"
                    className="w-full rounded-md border border-[#d6dcff] bg-white px-3 py-2"
                  />
                </div>
              </div>
            ))}
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
