import EnquiryForm from "@/components/forms/EnquiryForm";
import PageSection from "@/components/ui/PageSection";
import { getCatalogData } from "@/lib/catalog";
import { getPageHeroContent } from "@/lib/page-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit an Enquiry",
  description: "Submit a maintenance enquiry to Totalserve and we will match you with the right professional.",
};

export default async function EnquiryPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; city?: string; urgency?: string }>;
}) {
  const { services, cities } = await getCatalogData();
  const pageHero = await getPageHeroContent("enquiry");
  const params = await searchParams;

  return (
    <>
      <div className="bg-gradient-to-br from-[#2E3192] to-[#1a1d6b] text-white py-14 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#00AEEF]/20 border border-[#00AEEF]/30 rounded-full px-4 py-2 mb-6">
            <span className="text-[#00AEEF] text-sm font-semibold">Free to Submit</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-4">{pageHero.title}</h1>
          <p className="text-gray-300 text-lg">
            {pageHero.subtitle}
          </p>
        </div>
      </div>

      <PageSection background="light" className="py-12">
        <div className="max-w-2xl mx-auto">
          <EnquiryForm
            prefilledService={params.service || ""}
            prefilledCity={params.city || ""}
            prefilledUrgency={params.urgency || ""}
            services={services}
            cities={cities}
          />
        </div>
      </PageSection>

      <PageSection background="white" className="py-10">
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            {[
              { icon: "🔒", title: "Secure & Private", desc: "Your details are never shared without consent." },
              { icon: "⚡", title: "Fast Response", desc: "We aim to respond within 2–4 business hours." },
              { icon: "✅", title: "Vetted Professionals", desc: "Only checked, qualified artisans in our network." },
            ].map((item) => (
              <div key={item.title} className="p-5 rounded-2xl bg-[#F5F7FA] border border-gray-100">
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="font-bold text-[#231F20] text-sm mb-1">{item.title}</div>
                <div className="text-gray-500 text-xs">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </PageSection>
    </>
  );
}
