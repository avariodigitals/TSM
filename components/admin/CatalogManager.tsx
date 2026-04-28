"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminToast,
  getErrorMessage,
  useAdminToast,
} from "@/components/admin/AdminClientHelpers";
import { services as defaultServices, cities as defaultCities, serviceCityMappings as defaultMappings } from "@/lib/data";
import type { City, Service, ServiceCityMapping } from "@/lib/types";

type SettingRow = {
  id: string;
  key: string;
  value: unknown;
};

type Tab = "services" | "cities" | "mapping";

export default function CatalogManager({ settings }: { settings: SettingRow[] }) {
  const router = useRouter();
  const { toast, showToast } = useAdminToast();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("services");

  const initialData = useMemo(() => {
    const map = new Map(settings.map((row) => [row.key, row.value]));

    return {
      services: Array.isArray(map.get("catalog.services")) ? (map.get("catalog.services") as Service[]) : defaultServices,
      cities: Array.isArray(map.get("catalog.cities")) ? (map.get("catalog.cities") as City[]) : defaultCities,
      mappings: Array.isArray(map.get("catalog.mappings"))
        ? (map.get("catalog.mappings") as ServiceCityMapping[])
        : defaultMappings,
    };
  }, [settings]);

  const [services, setServices] = useState<Service[]>(initialData.services);
  const [cities, setCities] = useState<City[]>(initialData.cities);
  const [mappings, setMappings] = useState<ServiceCityMapping[]>(initialData.mappings);

  const [serviceDraft, setServiceDraft] = useState<Service>({
    id: "",
    name: "",
    slug: "",
    icon: "🛠️",
    description: "",
    shortDescription: "",
    commonIssues: [],
    color: "#00AEEF",
  });

  const [cityDraft, setCityDraft] = useState<City>({
    id: "",
    name: "",
    slug: "",
    region: "",
    description: "",
  });

  const [issuesDraft, setIssuesDraft] = useState("");

  const sortedServices = useMemo(() => [...services].sort((a, b) => a.name.localeCompare(b.name)), [services]);
  const sortedCities = useMemo(() => [...cities].sort((a, b) => a.name.localeCompare(b.name)), [cities]);

  function upsertService() {
    if (!serviceDraft.name || !serviceDraft.slug) {
      showToast("Service name and slug are required.", "error");
      return;
    }

    const nextService: Service = {
      ...serviceDraft,
      commonIssues: issuesDraft
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      id: serviceDraft.id || `service-${Date.now()}`,
    };

    setServices((current) => {
      const existingIndex = current.findIndex((item) => item.slug === nextService.slug || item.id === nextService.id);
      if (existingIndex === -1) {
        return [...current, nextService];
      }

      const next = [...current];
      next[existingIndex] = nextService;
      return next;
    });

    setServiceDraft({
      id: "",
      name: "",
      slug: "",
      icon: "🛠️",
      description: "",
      shortDescription: "",
      commonIssues: [],
      color: "#00AEEF",
    });
    setIssuesDraft("");
    showToast("Service staged successfully.");
  }

  function upsertCity() {
    if (!cityDraft.name || !cityDraft.slug) {
      showToast("City name and slug are required.", "error");
      return;
    }

    const nextCity = { ...cityDraft, id: cityDraft.id || `city-${Date.now()}` };

    setCities((current) => {
      const existingIndex = current.findIndex((item) => item.slug === nextCity.slug || item.id === nextCity.id);
      if (existingIndex === -1) {
        return [...current, nextCity];
      }

      const next = [...current];
      next[existingIndex] = nextCity;
      return next;
    });

    setCityDraft({
      id: "",
      name: "",
      slug: "",
      region: "",
      description: "",
    });
    showToast("City staged successfully.");
  }

  function toggleMapping(serviceSlug: string, citySlug: string, checked: boolean) {
    setMappings((current) => {
      const exists = current.some((mapping) => mapping.serviceSlug === serviceSlug && mapping.citySlug === citySlug);

      if (checked && !exists) {
        return [...current, { serviceSlug, citySlug }];
      }

      if (!checked && exists) {
        return current.filter((mapping) => !(mapping.serviceSlug === serviceSlug && mapping.citySlug === citySlug));
      }

      return current;
    });
  }

  async function saveAllCatalogChanges() {
    setError("");
    setIsSaving(true);

    const payloads = [
      { key: "catalog.services", value: services, description: "Managed list of available services" },
      { key: "catalog.cities", value: cities, description: "Managed list of available cities" },
      { key: "catalog.mappings", value: mappings, description: "Managed service-city availability map" },
    ];

    try {
      for (const payload of payloads) {
        const response = await fetch("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(await getErrorMessage(response, "Failed to save catalog settings."));
        }
      }

      showToast("Services, cities, and mapping saved successfully.");
      router.refresh();
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Failed to save catalog settings.";
      setError(message);
      showToast("Catalog update failed.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <AdminToast toast={toast} />

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <h1 className="text-2xl font-black text-[#231F20]">Services & Cities Control</h1>
        <p className="mt-2 text-sm text-gray-500">Manage services, locations, and assignments with friendly field controls.</p>

        <div className="mt-4 inline-flex rounded-xl border border-gray-200 bg-[#F8FAF5] p-1">
          {[
            { id: "services", label: "Services" },
            { id: "cities", label: "Cities" },
            { id: "mapping", label: "Service × City Mapping" },
          ].map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => setTab(item.id as Tab)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${tab === item.id ? "bg-[#0f5c2f] text-white" : "text-[#1f2937]"}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === "services" ? (
          <div className="mt-5 space-y-4">
            <h2 className="text-lg font-black text-[#231F20]">Service Editor</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input value={serviceDraft.name} onChange={(event) => setServiceDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Service name" className="rounded-md border border-gray-300 px-3 py-2" />
              <input value={serviceDraft.slug} onChange={(event) => setServiceDraft((current) => ({ ...current, slug: event.target.value }))} placeholder="service-slug" className="rounded-md border border-gray-300 px-3 py-2" />
              <input value={serviceDraft.icon} onChange={(event) => setServiceDraft((current) => ({ ...current, icon: event.target.value }))} placeholder="Icon" className="rounded-md border border-gray-300 px-3 py-2" />
              <input value={serviceDraft.color} onChange={(event) => setServiceDraft((current) => ({ ...current, color: event.target.value }))} placeholder="#00AEEF" className="rounded-md border border-gray-300 px-3 py-2" />
            </div>
            <input value={serviceDraft.shortDescription} onChange={(event) => setServiceDraft((current) => ({ ...current, shortDescription: event.target.value }))} placeholder="Short description" className="w-full rounded-md border border-gray-300 px-3 py-2" />
            <textarea value={serviceDraft.description} onChange={(event) => setServiceDraft((current) => ({ ...current, description: event.target.value }))} rows={3} placeholder="Service description" className="w-full rounded-md border border-gray-300 px-3 py-2" />
            <textarea value={issuesDraft} onChange={(event) => setIssuesDraft(event.target.value)} rows={4} placeholder="Common issues, one per line" className="w-full rounded-md border border-gray-300 px-3 py-2" />

            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={upsertService} className="rounded-lg bg-[#0f5c2f] px-4 py-2 font-semibold text-white">Add / Update Service</button>
            </div>

            <div className="rounded-xl border border-gray-200 overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F5F7FA] text-left">
                  <tr>
                    <th className="p-3">Service</th>
                    <th className="p-3">Slug</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedServices.map((service) => (
                    <tr key={service.id} className="border-t border-gray-100">
                      <td className="p-3">{service.icon} {service.name}</td>
                      <td className="p-3">{service.slug}</td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => {
                            setServiceDraft(service);
                            setIssuesDraft(service.commonIssues.join("\n"));
                          }}
                          className="rounded-lg border border-[#0f5c2f] px-3 py-1 text-xs font-semibold text-[#0f5c2f]"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {tab === "cities" ? (
          <div className="mt-5 space-y-4">
            <h2 className="text-lg font-black text-[#231F20]">City Editor</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input value={cityDraft.name} onChange={(event) => setCityDraft((current) => ({ ...current, name: event.target.value }))} placeholder="City name" className="rounded-md border border-gray-300 px-3 py-2" />
              <input value={cityDraft.slug} onChange={(event) => setCityDraft((current) => ({ ...current, slug: event.target.value }))} placeholder="city-slug" className="rounded-md border border-gray-300 px-3 py-2" />
              <input value={cityDraft.region} onChange={(event) => setCityDraft((current) => ({ ...current, region: event.target.value }))} placeholder="Region" className="rounded-md border border-gray-300 px-3 py-2" />
              <input value={cityDraft.description} onChange={(event) => setCityDraft((current) => ({ ...current, description: event.target.value }))} placeholder="City description" className="rounded-md border border-gray-300 px-3 py-2" />
            </div>

            <button type="button" onClick={upsertCity} className="rounded-lg bg-[#0f5c2f] px-4 py-2 font-semibold text-white">Add / Update City</button>

            <div className="rounded-xl border border-gray-200 overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F5F7FA] text-left">
                  <tr>
                    <th className="p-3">City</th>
                    <th className="p-3">Region</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCities.map((city) => (
                    <tr key={city.id} className="border-t border-gray-100">
                      <td className="p-3">{city.name}</td>
                      <td className="p-3">{city.region}</td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => setCityDraft(city)}
                          className="rounded-lg border border-[#0f5c2f] px-3 py-1 text-xs font-semibold text-[#0f5c2f]"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {tab === "mapping" ? (
          <div className="mt-5 space-y-4">
            <h2 className="text-lg font-black text-[#231F20]">Service × City Assignment</h2>
            <p className="text-sm text-gray-500">Tick where each service should appear. This controls search, forms, and location pages.</p>
            <div className="overflow-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-[#F5F7FA]">
                  <tr>
                    <th className="p-3 text-left min-w-48">Service</th>
                    {sortedCities.map((city) => (
                      <th key={city.slug} className="p-3 text-center whitespace-nowrap">{city.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedServices.map((service) => (
                    <tr key={service.slug} className="border-t border-gray-100">
                      <td className="p-3 font-semibold">{service.name}</td>
                      {sortedCities.map((city) => {
                        const checked = mappings.some(
                          (mapping) => mapping.serviceSlug === service.slug && mapping.citySlug === city.slug
                        );

                        return (
                          <td key={`${service.slug}-${city.slug}`} className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(event) =>
                                toggleMapping(service.slug, city.slug, event.target.checked)
                              }
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <button
          type="button"
          onClick={() => void saveAllCatalogChanges()}
          disabled={isSaving}
          className="mt-6 rounded-lg bg-[#2E3192] px-4 py-2 font-semibold text-white disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save All Catalog Changes"}
        </button>
      </div>
    </div>
  );
}
