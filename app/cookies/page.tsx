import PageSection from "@/components/ui/PageSection";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { getPageHeroContent } from "@/lib/page-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Read how Total Serve Maintenance Ltd may use cookies and similar technologies.",
};

const cookieTypes = [
  {
    title: "Essential Cookies",
    desc: "These help the website function properly, support basic navigation, maintain security, and remember actions needed to provide the service.",
  },
  {
    title: "Analytics Cookies",
    desc: "If enabled, these help us understand website usage, popular pages, traffic sources, and performance so we can improve the website.",
  },
  {
    title: "Integration Cookies",
    desc: "Some optional integrations, such as analytics, pixels, or communication tools, may set cookies or similar identifiers when enabled.",
  },
];

const cookieSections = [
  {
    title: "What Cookies Are",
    body: "Cookies are small files stored on your device by a website. Similar technologies can also be used to remember preferences, measure usage, or support security and integrations.",
  },
  {
    title: "How We May Use Them",
    body: "Total Serve may use cookies to keep the website working, understand how visitors use the site, improve performance, support integrations, and help us deliver a smoother online experience.",
  },
  {
    title: "Managing Cookies",
    body: "You can usually manage or block cookies through your browser settings. Blocking some cookies may affect website features, forms, analytics, or integrations.",
  },
  {
    title: "Third Party Services",
    body: "Where third party tools are enabled, those providers may process cookie or device information according to their own policies. This can include analytics, search console, pixel, or communication services configured for the site.",
  },
];

export default async function CookiesPage() {
  const pageHero = await getPageHeroContent("cookies");

  return (
    <>
      <div className="bg-gradient-to-br from-[#2E3192] to-[#1a1d6b] text-white py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-black mb-4">{pageHero.title}</h1>
          <p className="text-gray-300 text-lg">{pageHero.subtitle}</p>
        </div>
      </div>

      <PageSection background="white" className="py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#F5F7FA] rounded-2xl p-6 sm:p-8 mb-10">
            <div className="inline-flex items-center gap-2 bg-[#00AEEF]/10 rounded-full px-4 py-2 mb-4">
              <span className="text-[#00AEEF] text-sm font-semibold">Last updated: 1 May 2026</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              This policy explains how cookies and similar technologies may be used when you visit the Total Serve website.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            {cookieTypes.map((type) => (
              <div key={type.title} className="bg-[#F5F7FA] rounded-2xl p-6">
                <h2 className="font-black text-[#231F20] text-base mb-2">{type.title}</h2>
                <p className="text-gray-500 text-sm leading-relaxed">{type.desc}</p>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            {cookieSections.map((section) => (
              <div key={section.title} className="border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-black text-[#231F20] mb-3">{section.title}</h2>
                <p className="text-gray-600 text-sm leading-relaxed">{section.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 bg-[#231F20] rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-black mb-3">Questions About Cookies?</h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              Contact us if you have questions about cookies, integrations, or privacy on the Total Serve website.
            </p>
            <Link href="/privacy">
              <Button variant="red" size="md">View Privacy Policy</Button>
            </Link>
          </div>
        </div>
      </PageSection>
    </>
  );
}
