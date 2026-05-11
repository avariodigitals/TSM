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
  metadataBase: new URL("https://totalservemaintenance.com"),
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
    url: "https://totalservemaintenance.com",
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

type SiteFooterSettings = {
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

type LaunchBannerSettings = {
  enabled: boolean;
  message: string;
  hideFrontend: boolean;
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
  supportEmail: "enquiries@totalservemaintenance.com",
  supportPhone: "0800 123 4567",
  siteUrl: "https://totalservemaintenance.com",
};

const defaultFooter: SiteFooterSettings = {
  locationLabel: "Location",
  locationValue: "United Kingdom",
  servicesTitle: "Our Services",
  servicesViewAllLabel: "View all services →",
  servicesViewAllHref: "/services",
  citiesTitle: "Cities We Cover",
  companyTitle: "Company",
  companyLinks: [
    { href: "/about", label: "About Total Serve" },
    { href: "/blog", label: "Blog" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/register-artisan", label: "Register as Artisan" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact Us" },
  ],
  urgentTitle: "Need help urgently?",
  urgentButtonLabel: "🚨 Submit Emergency Enquiry",
  urgentButtonHref: "/enquiry?urgency=emergency",
  copyrightText: "© {year} Total Serve Maintenance Ltd. All rights reserved.",
  developerPrefix: "Developed by",
  developerName: "Avario Digitals",
  developerUrl: "https://www.avariodigitals.com",
  legalLinks: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Use" },
    { href: "/cookies", label: "Cookies" },
  ],
};

const defaultLaunchBanner: LaunchBannerSettings = {
  enabled: false,
  message: "We are launching soon.",
  hideFrontend: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [integrations, branding, headerFooter, general, footer, launchBanner, catalog] = await Promise.all([
    getSettingValue<IntegrationsConfig>("site.integrations", defaultIntegrations),
    getSettingValue<SiteBrandingSettings>("site.branding", defaultBranding),
    getSettingValue<SiteHeaderFooterSettings>("site.headerFooter", defaultHeaderFooter),
    getSettingValue<SiteGeneralSettings>("site.general", defaultGeneral),
    getSettingValue<SiteFooterSettings>("site.footer", defaultFooter),
    getSettingValue<LaunchBannerSettings>("site.launchBanner", defaultLaunchBanner),
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
          siteSettings={{
            branding,
            headerFooter,
            general,
            footer,
            launchBanner,
            catalog: { services: catalog.services, cities: catalog.cities },
          }}
        >
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}
