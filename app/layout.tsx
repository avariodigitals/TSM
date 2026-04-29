import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/layout/SiteChrome";
import { getSettingValue } from "@/lib/site-settings";
import { getCatalogData } from "@/lib/catalog";

export const dynamic = "force-dynamic";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  applicationName: "Total Serve Maintenance Ltd",
  title: {
    default: "Total Serve Maintenance Ltd | Trusted Tradespeople Across the UK",
    template: "%s | Total Serve Maintenance Ltd",
  },
  description:
    "Submit an enquiry for trusted electricians, plumbers, gas engineers, carpenters and more across the UK. Total Serve reviews your request and assigns the right professional.",
  keywords: ["tradespeople UK", "electrician", "plumber", "gas engineer", "maintenance", "Total Serve"],
  metadataBase: new URL("https://totalserve.co.uk"),
  icons: {
    icon: "/tml-logo.webp",
    shortcut: "/tml-logo.webp",
    apple: "/tml-logo.webp",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Total Serve Maintenance Ltd | Trusted Tradespeople Across the UK",
    description:
      "Search by service and location, submit an enquiry, and Total Serve assigns the right vetted professional.",
    url: "https://totalserve.co.uk",
    siteName: "Total Serve Maintenance Ltd",
    locale: "en_GB",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Total Serve Maintenance Ltd",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Total Serve Maintenance Ltd",
    description:
      "Find trusted tradespeople across the UK. Submit an enquiry and Total Serve assigns the right professional.",
    images: ["/twitter-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "Home Services",
};

type IntegrationsConfig = {
  analytics: {
    enabled: boolean;
    script: string;
  };
  searchConsole: {
    enabled: boolean;
    verification: string;
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

type SiteBrandingSettings = {
  logoUrl: string;
  footerText: string;
};

type SiteHeaderFooterSettings = {
  headerCtaLabel: string;
  headerCtaHref: string;
  footerCompanyBlurb: string;
};

type SiteGeneralSettings = {
  siteName: string;
  supportEmail: string;
  supportPhone: string;
  siteUrl: string;
};

const defaultIntegrations: IntegrationsConfig = {
  analytics: { enabled: false, script: "" },
  searchConsole: { enabled: false, verification: "" },
  pixel: { enabled: false, script: "" },
  whatsapp: { enabled: false, phone: "", message: "", label: "WhatsApp" },
  customScripts: [],
};

const defaultBranding: SiteBrandingSettings = {
  logoUrl: "/tml-logo.webp",
  footerText: "Total Serve Maintenance Ltd",
};

const defaultHeaderFooter: SiteHeaderFooterSettings = {
  headerCtaLabel: "Submit Enquiry",
  headerCtaHref: "/enquiry",
  footerCompanyBlurb:
    "Connecting people across the UK with trusted, vetted tradespeople. Submit an enquiry and let Total Serve do the rest.",
};

const defaultGeneral: SiteGeneralSettings = {
  siteName: "Total Serve Maintenance Ltd",
  supportEmail: "enquiries@totalserve.co.uk",
  supportPhone: "0800 123 4567",
  siteUrl: "https://totalserve.co.uk",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [integrations, branding, headerFooter, general, catalog] = await Promise.all([
    getSettingValue<IntegrationsConfig>("site.integrations", defaultIntegrations),
    getSettingValue<SiteBrandingSettings>("site.branding", defaultBranding),
    getSettingValue<SiteHeaderFooterSettings>("site.headerFooter", defaultHeaderFooter),
    getSettingValue<SiteGeneralSettings>("site.general", defaultGeneral),
    getCatalogData(),
  ]);

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link rel="icon" href={branding.logoUrl || "/tml-logo.webp"} />
        <link rel="apple-touch-icon" href={branding.logoUrl || "/tml-logo.webp"} />
        {integrations.searchConsole.enabled && integrations.searchConsole.verification ? (
          <meta name="google-site-verification" content={integrations.searchConsole.verification} />
        ) : null}
      </head>
      <body className="min-h-full flex flex-col bg-white text-[#231F20]">
        <SiteChrome
          integrations={integrations}
          siteSettings={{ branding, headerFooter, general, catalog: { services: catalog.services, cities: catalog.cities } }}
        >
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}
