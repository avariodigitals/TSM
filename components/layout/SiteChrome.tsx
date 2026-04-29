"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import type { City, Service } from "@/lib/types";

type IntegrationsConfig = {
  analytics: {
    enabled: boolean;
    script: string;
  };
  pixel: {
    enabled: boolean;
    script: string;
  };
  whatsapp: {
    enabled: boolean;
    phone: string;
    message: string;
    label: string;
  };
  customScripts: Array<{
    id: string;
    enabled: boolean;
    script: string;
  }>;
};

type SiteChromeSettings = {
  branding: {
    logoUrl: string;
  };
  headerFooter: {
    headerCtaLabel: string;
    headerCtaHref: string;
    footerCompanyBlurb: string;
  };
  general: {
    supportEmail: string;
    supportPhone: string;
  };
  footer: {
    locationLabel: string;
    locationValue: string;
    servicesTitle: string;
    servicesViewAllLabel: string;
    servicesViewAllHref: string;
    citiesTitle: string;
    companyTitle: string;
    companyLinks: Array<{ href: string; label: string }>;
    urgentTitle: string;
    urgentButtonLabel: string;
    urgentButtonHref: string;
    copyrightText: string;
    developerPrefix: string;
    developerName: string;
    developerUrl: string;
    legalLinks: Array<{ href: string; label: string }>;
  };
  catalog: {
    services: Service[];
    cities: City[];
  };
};

export default function SiteChrome({
  children,
  integrations,
  siteSettings,
}: {
  children: React.ReactNode;
  integrations: IntegrationsConfig;
  siteSettings: SiteChromeSettings;
}) {
  const pathname = usePathname();
  const isAdminRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth/admin-login");

  if (isAdminRoute) {
    return <main className="min-h-full">{children}</main>;
  }

  const whatsappHref = integrations.whatsapp.phone
    ? `https://wa.me/${integrations.whatsapp.phone.replace(/[^\\d]/g, "")}?text=${encodeURIComponent(
        integrations.whatsapp.message || "Hi, I need support from Total Serve."
      )}`
    : "";

  return (
    <>
      {integrations.analytics.enabled && integrations.analytics.script ? (
        <Script id="analytics-script" strategy="afterInteractive">
          {integrations.analytics.script}
        </Script>
      ) : null}

      {integrations.pixel.enabled && integrations.pixel.script ? (
        <Script id="pixel-script" strategy="afterInteractive">
          {integrations.pixel.script}
        </Script>
      ) : null}

      {integrations.customScripts
        .filter((item) => item.enabled && item.script)
        .map((item) => (
          <Script key={item.id} id={`custom-script-${item.id}`} strategy="afterInteractive">
            {item.script}
          </Script>
        ))}

      <Header
        logoUrl={siteSettings.branding.logoUrl}
        ctaLabel={siteSettings.headerFooter.headerCtaLabel}
        ctaHref={siteSettings.headerFooter.headerCtaHref}
      />
      <main className="flex-1">{children}</main>
      <Footer
        logoUrl={siteSettings.branding.logoUrl}
        companyBlurb={siteSettings.headerFooter.footerCompanyBlurb}
        supportEmail={siteSettings.general.supportEmail}
        supportPhone={siteSettings.general.supportPhone}
        services={siteSettings.catalog.services}
        cities={siteSettings.catalog.cities}
        content={siteSettings.footer}
      />

      {integrations.whatsapp.enabled && whatsappHref ? (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-xl hover:bg-[#1fab54]"
          aria-label={integrations.whatsapp.label || "Chat with us on WhatsApp"}
        >
          <span className="text-base">💬</span>
          {integrations.whatsapp.label || "WhatsApp"}
        </a>
      ) : null}
    </>
  );
}
