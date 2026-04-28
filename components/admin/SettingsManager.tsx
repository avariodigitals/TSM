"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminTableControls,
  AdminToast,
  getErrorMessage,
  useAdminToast,
} from "@/components/admin/AdminClientHelpers";

type SettingRow = {
  id: string;
  key: string;
  value: unknown;
  description: string | null;
};

type SiteGeneralSettings = {
  siteName: string;
  supportEmail: string;
  supportPhone: string;
  siteUrl: string;
};

type SiteBrandingSettings = {
  logoUrl: string;
  footerText: string;
};

type SiteHeaderFooterSettings = {
  headerCtaLabel: string;
  headerCtaHref: string;
  footerCompanyBlurb: string;
};

type SiteSmtpSettings = {
  enabled: boolean;
  host: string;
  port: string;
  user: string;
  pass: string;
  from: string;
};

type SiteIntegrationsSettings = {
  analytics: { enabled: boolean; script: string };
  searchConsole: { enabled: boolean; verification: string };
  pixel: { enabled: boolean; script: string };
  whatsapp: { enabled: boolean; phone: string; message: string; label: string };
  customScripts: Array<{ id: string; enabled: boolean; script: string }>;
};

const pageSize = 12;

export default function SettingsManager({ settings }: { settings: SettingRow[] }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    key: "",
    value: "",
    description: "",
  });
  const { toast, showToast } = useAdminToast();

  const settingsMap = useMemo(() => {
    return new Map(settings.map((setting) => [setting.key, setting.value]));
  }, [settings]);

  const [generalDraft, setGeneralDraft] = useState<SiteGeneralSettings>(
    (settingsMap.get("site.general") as SiteGeneralSettings | undefined) ?? {
      siteName: "Total Serve Maintenance Ltd",
      supportEmail: "enquiries@totalserve.co.uk",
      supportPhone: "0800 123 4567",
      siteUrl: "https://totalserve.co.uk",
    }
  );

  const [brandingDraft, setBrandingDraft] = useState<SiteBrandingSettings>(
    (settingsMap.get("site.branding") as SiteBrandingSettings | undefined) ?? {
      logoUrl: "/tml-logo.webp",
      footerText: "Total Serve Maintenance Ltd",
    }
  );

  const [headerFooterDraft, setHeaderFooterDraft] = useState<SiteHeaderFooterSettings>(
    (settingsMap.get("site.headerFooter") as SiteHeaderFooterSettings | undefined) ?? {
      headerCtaLabel: "Submit Enquiry",
      headerCtaHref: "/enquiry",
      footerCompanyBlurb:
        "Connecting people across the UK with trusted, vetted tradespeople. Submit an enquiry and let Total Serve do the rest.",
    }
  );

  const [smtpDraft, setSmtpDraft] = useState<SiteSmtpSettings>(
    (settingsMap.get("site.smtp") as SiteSmtpSettings | undefined) ?? {
      enabled: false,
      host: "",
      port: "587",
      user: "",
      pass: "",
      from: "",
    }
  );

  const [integrationsDraft, setIntegrationsDraft] = useState<SiteIntegrationsSettings>(
    (settingsMap.get("site.integrations") as SiteIntegrationsSettings | undefined) ?? {
      analytics: { enabled: false, script: "" },
      searchConsole: { enabled: false, verification: "" },
      pixel: { enabled: false, script: "" },
      whatsapp: { enabled: false, phone: "", message: "", label: "WhatsApp" },
      customScripts: [],
    }
  );
  const [customScriptsDraft, setCustomScriptsDraft] = useState(
    JSON.stringify(integrationsDraft.customScripts, null, 2)
  );

  const filteredSettings = useMemo(() => {
    return settings.filter((setting) => {
      return [setting.key, JSON.stringify(setting.value), setting.description ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(query.trim().toLowerCase());
    });
  }, [query, settings]);

  const totalPages = Math.max(1, Math.ceil(filteredSettings.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedSettings = filteredSettings.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function resetDraft() {
    setDraft({ key: "", value: "", description: "" });
    setEditingId(null);
  }

  function loadSetting(setting: SettingRow) {
    setDraft({
      key: setting.key,
      value: JSON.stringify(setting.value),
      description: setting.description ?? "",
    });
    setEditingId(setting.id);
    setError("");
  }

  async function upsertSetting(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    const key = draft.key.trim();
    const rawValue = draft.value;
    const description = draft.description.trim();

    let value: unknown = rawValue;
    try {
      value = JSON.parse(rawValue);
    } catch {
      // Accept plain string values as-is.
    }

    const existingSetting = settings.find((setting) => setting.key === key);

    if (
      existingSetting &&
      !window.confirm(`Overwrite the existing setting for ${key}?`)
    ) {
      setIsSaving(false);
      return;
    }

    const response = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value, description }),
    });

    setIsSaving(false);

    if (!response.ok) {
      setError(await getErrorMessage(response, "Failed to save setting."));
      showToast("Setting save failed.", "error");
      return;
    }

    resetDraft();
    showToast(existingSetting ? "Setting updated successfully." : "Setting created successfully.");
    router.refresh();
  }

  async function saveStructuredSetting(key: string, value: unknown, description: string, successMessage: string) {
    setError("");
    setIsSaving(true);

    const response = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value, description }),
    });

    setIsSaving(false);

    if (!response.ok) {
      setError(await getErrorMessage(response, `Failed to save ${key}.`));
      showToast("Setting save failed.", "error");
      return;
    }

    showToast(successMessage);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <AdminToast toast={toast} />

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 space-y-5">
        <h1 className="text-2xl font-black text-[#231F20]">Site Configuration</h1>

        <div className="rounded-xl border border-gray-200 p-4 space-y-3">
          <h2 className="text-lg font-black text-[#231F20]">General</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={generalDraft.siteName} onChange={(event) => setGeneralDraft((current) => ({ ...current, siteName: event.target.value }))} placeholder="Site name" className="rounded-md border border-gray-300 px-3 py-2" />
            <input value={generalDraft.siteUrl} onChange={(event) => setGeneralDraft((current) => ({ ...current, siteUrl: event.target.value }))} placeholder="Site URL" className="rounded-md border border-gray-300 px-3 py-2" />
            <input value={generalDraft.supportEmail} onChange={(event) => setGeneralDraft((current) => ({ ...current, supportEmail: event.target.value }))} placeholder="Support email" className="rounded-md border border-gray-300 px-3 py-2" />
            <input value={generalDraft.supportPhone} onChange={(event) => setGeneralDraft((current) => ({ ...current, supportPhone: event.target.value }))} placeholder="Support phone" className="rounded-md border border-gray-300 px-3 py-2" />
          </div>
          <button type="button" onClick={() => void saveStructuredSetting("site.general", generalDraft, "General site identity settings", "General settings saved.")} className="rounded-lg bg-[#2E3192] px-4 py-2 font-semibold text-white disabled:opacity-50" disabled={isSaving}>
            Save General
          </button>
        </div>

        <div className="rounded-xl border border-gray-200 p-4 space-y-3">
          <h2 className="text-lg font-black text-[#231F20]">Branding / Header / Footer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={brandingDraft.logoUrl} onChange={(event) => setBrandingDraft((current) => ({ ...current, logoUrl: event.target.value }))} placeholder="Logo URL" className="rounded-md border border-gray-300 px-3 py-2" />
            <input value={brandingDraft.footerText} onChange={(event) => setBrandingDraft((current) => ({ ...current, footerText: event.target.value }))} placeholder="Footer text" className="rounded-md border border-gray-300 px-3 py-2" />
            <input value={headerFooterDraft.headerCtaLabel} onChange={(event) => setHeaderFooterDraft((current) => ({ ...current, headerCtaLabel: event.target.value }))} placeholder="Header CTA label" className="rounded-md border border-gray-300 px-3 py-2" />
            <input value={headerFooterDraft.headerCtaHref} onChange={(event) => setHeaderFooterDraft((current) => ({ ...current, headerCtaHref: event.target.value }))} placeholder="Header CTA href" className="rounded-md border border-gray-300 px-3 py-2" />
          </div>
          <textarea value={headerFooterDraft.footerCompanyBlurb} onChange={(event) => setHeaderFooterDraft((current) => ({ ...current, footerCompanyBlurb: event.target.value }))} rows={3} placeholder="Footer company blurb" className="w-full rounded-md border border-gray-300 px-3 py-2" />
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => void saveStructuredSetting("site.branding", brandingDraft, "Logo and core branding controls", "Branding settings saved.")} className="rounded-lg bg-[#2E3192] px-4 py-2 font-semibold text-white disabled:opacity-50" disabled={isSaving}>
              Save Branding
            </button>
            <button type="button" onClick={() => void saveStructuredSetting("site.headerFooter", headerFooterDraft, "Header and footer display controls", "Header/Footer settings saved.")} className="rounded-lg bg-[#2E3192] px-4 py-2 font-semibold text-white disabled:opacity-50" disabled={isSaving}>
              Save Header/Footer
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 p-4 space-y-3">
          <h2 className="text-lg font-black text-[#231F20]">SMTP</h2>
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-[#231F20]">
            <input type="checkbox" checked={smtpDraft.enabled} onChange={(event) => setSmtpDraft((current) => ({ ...current, enabled: event.target.checked }))} />
            Enable SMTP from backend settings
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={smtpDraft.host} onChange={(event) => setSmtpDraft((current) => ({ ...current, host: event.target.value }))} placeholder="SMTP host" className="rounded-md border border-gray-300 px-3 py-2" />
            <input value={smtpDraft.port} onChange={(event) => setSmtpDraft((current) => ({ ...current, port: event.target.value }))} placeholder="SMTP port" className="rounded-md border border-gray-300 px-3 py-2" />
            <input value={smtpDraft.user} onChange={(event) => setSmtpDraft((current) => ({ ...current, user: event.target.value }))} placeholder="SMTP username" className="rounded-md border border-gray-300 px-3 py-2" />
            <input type="password" value={smtpDraft.pass} onChange={(event) => setSmtpDraft((current) => ({ ...current, pass: event.target.value }))} placeholder="SMTP password" className="rounded-md border border-gray-300 px-3 py-2" />
            <input value={smtpDraft.from} onChange={(event) => setSmtpDraft((current) => ({ ...current, from: event.target.value }))} placeholder="SMTP from address" className="rounded-md border border-gray-300 px-3 py-2 md:col-span-2" />
          </div>
          <button type="button" onClick={() => void saveStructuredSetting("site.smtp", smtpDraft, "SMTP transport settings", "SMTP settings saved.")} className="rounded-lg bg-[#2E3192] px-4 py-2 font-semibold text-white disabled:opacity-50" disabled={isSaving}>
            Save SMTP
          </button>
        </div>

        <div className="rounded-xl border border-gray-200 p-4 space-y-3">
          <h2 className="text-lg font-black text-[#231F20]">Integrations</h2>
          <div className="space-y-3">
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-[#231F20]"><input type="checkbox" checked={integrationsDraft.analytics.enabled} onChange={(event) => setIntegrationsDraft((current) => ({ ...current, analytics: { ...current.analytics, enabled: event.target.checked } }))} />Enable Analytics script</label>
            <textarea value={integrationsDraft.analytics.script} onChange={(event) => setIntegrationsDraft((current) => ({ ...current, analytics: { ...current.analytics, script: event.target.value } }))} rows={3} placeholder="Analytics script" className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-xs" />

            <label className="inline-flex items-center gap-2 text-sm font-semibold text-[#231F20]"><input type="checkbox" checked={integrationsDraft.searchConsole.enabled} onChange={(event) => setIntegrationsDraft((current) => ({ ...current, searchConsole: { ...current.searchConsole, enabled: event.target.checked } }))} />Enable Search Console verification</label>
            <input value={integrationsDraft.searchConsole.verification} onChange={(event) => setIntegrationsDraft((current) => ({ ...current, searchConsole: { ...current.searchConsole, verification: event.target.value } }))} placeholder="Google verification token" className="w-full rounded-md border border-gray-300 px-3 py-2" />

            <label className="inline-flex items-center gap-2 text-sm font-semibold text-[#231F20]"><input type="checkbox" checked={integrationsDraft.pixel.enabled} onChange={(event) => setIntegrationsDraft((current) => ({ ...current, pixel: { ...current.pixel, enabled: event.target.checked } }))} />Enable Pixel script</label>
            <textarea value={integrationsDraft.pixel.script} onChange={(event) => setIntegrationsDraft((current) => ({ ...current, pixel: { ...current.pixel, script: event.target.value } }))} rows={3} placeholder="Pixel script" className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-xs" />

            <label className="inline-flex items-center gap-2 text-sm font-semibold text-[#231F20]"><input type="checkbox" checked={integrationsDraft.whatsapp.enabled} onChange={(event) => setIntegrationsDraft((current) => ({ ...current, whatsapp: { ...current.whatsapp, enabled: event.target.checked } }))} />Enable WhatsApp floating button</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input value={integrationsDraft.whatsapp.phone} onChange={(event) => setIntegrationsDraft((current) => ({ ...current, whatsapp: { ...current.whatsapp, phone: event.target.value } }))} placeholder="WhatsApp phone (e.g. 447...)" className="rounded-md border border-gray-300 px-3 py-2" />
              <input value={integrationsDraft.whatsapp.label} onChange={(event) => setIntegrationsDraft((current) => ({ ...current, whatsapp: { ...current.whatsapp, label: event.target.value } }))} placeholder="Button label" className="rounded-md border border-gray-300 px-3 py-2" />
            </div>
            <textarea value={integrationsDraft.whatsapp.message} onChange={(event) => setIntegrationsDraft((current) => ({ ...current, whatsapp: { ...current.whatsapp, message: event.target.value } }))} rows={2} placeholder="Default WhatsApp message" className="w-full rounded-md border border-gray-300 px-3 py-2" />

            <textarea
              value={customScriptsDraft}
              onChange={(event) => setCustomScriptsDraft(event.target.value)}
              rows={4}
              placeholder='Custom scripts JSON: [{"id":"chat-widget","enabled":true,"script":"..."}]'
              className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-xs"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              try {
                const customScripts = JSON.parse(customScriptsDraft) as SiteIntegrationsSettings["customScripts"];
                void saveStructuredSetting(
                  "site.integrations",
                  { ...integrationsDraft, customScripts },
                  "Analytics/Search Console/Pixel/WhatsApp integration settings",
                  "Integration settings saved."
                );
              } catch {
                setError("Custom scripts JSON is invalid.");
                showToast("Custom scripts JSON is invalid.", "error");
              }
            }}
            className="rounded-lg bg-[#2E3192] px-4 py-2 font-semibold text-white disabled:opacity-50"
            disabled={isSaving}
          >
            Save Integrations
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <h1 className="text-2xl font-black text-[#231F20] mb-4">Settings</h1>
        <form onSubmit={upsertSetting} className="grid md:grid-cols-3 gap-3 items-end">
          <label className="text-sm font-medium text-[#231F20] space-y-1">
            <span>Key</span>
            <input
              name="key"
              required
              value={draft.key}
              onChange={(event) => setDraft((current) => ({ ...current, key: event.target.value }))}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium text-[#231F20] space-y-1 md:col-span-2">
            <span>Value (JSON or text)</span>
            <input
              name="value"
              required
              value={draft.value}
              onChange={(event) => setDraft((current) => ({ ...current, value: event.target.value }))}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium text-[#231F20] space-y-1 md:col-span-2">
            <span>Description</span>
            <input
              name="description"
              value={draft.description}
              onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </label>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={isSaving} className="rounded-lg bg-[#00AEEF] text-white px-4 py-2 font-semibold w-fit">
              {isSaving ? "Saving..." : editingId ? "Update Setting" : "Save Setting"}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={resetDraft}
                className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-[#231F20]"
              >
                Cancel Edit
              </button>
            ) : null}
          </div>
        </form>
        {editingId ? <p className="mt-3 text-sm text-gray-500">Editing an existing setting. Update the values and save.</p> : null}
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
            queryPlaceholder="Search by key, value, or description"
            totalCount={filteredSettings.length}
            page={currentPage}
            totalPages={totalPages}
            onPageChange={(nextPage) => setPage(Math.max(1, Math.min(nextPage, totalPages)))}
          />
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F7FA] text-left">
              <tr>
                <th className="p-3">Key</th>
                <th className="p-3">Value</th>
                <th className="p-3">Description</th>
                <th className="p-3">Quick Edit</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSettings.length === 0 ? (
                <tr>
                  <td className="p-6 text-center text-sm text-gray-500" colSpan={4}>
                    No settings matched the current search.
                  </td>
                </tr>
              ) : null}
              {paginatedSettings.map((setting) => (
                <tr key={setting.id} className="border-t border-gray-100">
                  <td className="p-3 font-semibold">{setting.key}</td>
                  <td className="p-3 text-xs text-gray-600 max-w-lg break-words">{JSON.stringify(setting.value)}</td>
                  <td className="p-3">{setting.description || "-"}</td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => loadSetting(setting)}
                      className="rounded-lg border border-[#00AEEF] px-3 py-2 text-xs font-semibold text-[#00AEEF] hover:bg-[#00AEEF]/10"
                    >
                      Load into form
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
