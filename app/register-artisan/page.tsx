import ArtisanRegistrationForm from "@/components/forms/ArtisanRegistrationForm";
import PageSection from "@/components/ui/PageSection";
import { getCatalogData } from "@/lib/catalog";
import { getPageHeroContent } from "@/lib/page-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register as an Artisan",
  description: "Join the Total Serve artisan network. Register your trade and receive relevant job opportunities across the UK.",
};

const benefits = [
  { icon: "🎯", title: "Receive Matched Jobs", desc: "We only send you enquiries that match your trade and coverage area." },
  { icon: "🔐", title: "Verified Network", desc: "Being part of Total Serve signals trust to customers — all artisans are vetted." },
  { icon: "📈", title: "Grow Your Business", desc: "Access a stream of relevant leads without expensive advertising." },
  { icon: "🤝", title: "We Handle the Matching", desc: "No chasing leads. We contact you with relevant opportunities." },
];

export default async function RegisterArtisanPage() {
  const { services, cities } = await getCatalogData();
  const pageHero = await getPageHeroContent("registerArtisan");

  return (
    <>
      <div className="bg-gradient-to-br from-[#231F20] to-[#2E3192] text-white py-14 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#ED1C24]/20 border border-[#ED1C24]/30 rounded-full px-4 py-2 mb-6">
            <span className="text-[#ED1C24] text-sm font-semibold">Join Our Network</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-4">{pageHero.title}</h1>
          <p className="text-gray-300 text-lg">
            {pageHero.subtitle}
          </p>
        </div>
      </div>

      {/* Benefits */}
      <PageSection background="light" className="py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {benefits.map((b) => (
            <div key={b.title} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
              <div className="text-3xl mb-3">{b.icon}</div>
              <div className="font-bold text-[#231F20] text-sm mb-1">{b.title}</div>
              <div className="text-gray-500 text-xs leading-relaxed">{b.desc}</div>
            </div>
          ))}
        </div>
      </PageSection>

      <PageSection background="white" className="py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-[#231F20] mb-2">Registration Form</h2>
            <p className="text-gray-500 text-sm">
              Complete the form below. Our team reviews all applications before approving access to the network.
            </p>
          </div>
          <ArtisanRegistrationForm services={services} cities={cities} />
        </div>
      </PageSection>

      {/* Artisan flow */}
      <PageSection background="light" className="py-14">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-black text-[#231F20] mb-10">How Artisan Registration Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            {[
              { step: 1, icon: "📝", title: "Register Your Trade", desc: "Complete the registration form with your details and qualifications." },
              { step: 2, icon: "🔍", title: "Get Reviewed", desc: "Our team checks your qualifications, insurance and experience." },
              { step: 3, icon: "✅", title: "Join the Network", desc: "Approved artisans are added to the internal Total Serve database." },
              { step: 4, icon: "💼", title: "Receive Opportunities", desc: "We contact you when a customer enquiry matches your trade and area." },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00AEEF] to-[#2E3192] flex items-center justify-center text-2xl shadow-md mb-4">
                  {s.icon}
                </div>
                <div className="font-bold text-[#231F20] text-sm mb-1">{s.title}</div>
                <div className="text-gray-500 text-xs leading-relaxed">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </PageSection>
    </>
  );
}
