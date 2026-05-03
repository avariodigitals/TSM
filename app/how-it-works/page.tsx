import PageSection from "@/components/ui/PageSection";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { getPageHeroContent } from "@/lib/page-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works",
  description: "Learn how Totalserve connects you with trusted tradespeople across the UK.",
};

export default async function HowItWorksPage() {
  const pageHero = await getPageHeroContent("howItWorks");

  return (
    <>
      <div className="bg-gradient-to-br from-[#2E3192] to-[#1a1d6b] text-white py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-black mb-4">{pageHero.title}</h1>
          <p className="text-gray-300 text-lg">
            {pageHero.subtitle}
          </p>
        </div>
      </div>

      {/* Customer flow */}
      <PageSection background="white" className="py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#00AEEF]/10 rounded-full px-4 py-2 mb-4">
              <span className="text-[#00AEEF] text-sm font-semibold">For Customers</span>
            </div>
            <h2 className="text-3xl font-black text-[#231F20] mb-3">Finding a Tradesperson</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              From your first search to job completion — here&apos;s exactly how the process works for customers.
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                step: 1,
                icon: "🔍",
                title: "Search by Service & Location",
                desc: "Use our search on the homepage to select your required service and your city or area. We&apos;ll check if that service is available in your location.",
                detail: "We currently cover major UK cities including London, Manchester, Birmingham, Leeds, Liverpool, Glasgow, Bristol, Sheffield and more.",
              },
              {
                step: 2,
                icon: "📋",
                title: "Submit an Enquiry",
                desc: "Fill in our short enquiry form with your name, contact details, job description, urgency level and preferred contact method.",
                detail: "This is completely free. We do not share your details without your consent.",
              },
              {
                step: 3,
                icon: "✅",
                title: "Total Serve Reviews Your Request",
                desc: "Our team reviews your enquiry and matches you with the most suitable vetted professional from our artisan database.",
                detail: "We consider your specific job requirements, urgency, location and the artisan&apos;s qualifications and availability.",
              },
              {
                step: 4,
                icon: "🤝",
                title: "We Connect You",
                desc: "Once matched, we contact you to confirm the professional and facilitate the connection. The artisan then gets in touch to arrange the work.",
                detail: "You are never pressured and there is no obligation to proceed if you are not happy with the match.",
              },
            ].map((step) => (
              <div key={step.step} className="flex gap-6 bg-[#F5F7FA] rounded-2xl p-6">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00AEEF] to-[#2E3192] flex items-center justify-center text-2xl shadow-md">
                  {step.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-[#00AEEF] uppercase tracking-wider">Step {step.step}</span>
                  </div>
                  <h3 className="font-black text-[#231F20] text-lg mb-1">{step.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-2">{step.desc}</p>
                  <p className="text-gray-400 text-xs leading-relaxed italic">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/enquiry">
              <Button variant="red" size="lg">Submit Your First Enquiry →</Button>
            </Link>
          </div>
        </div>
      </PageSection>

      {/* Artisan flow */}
      <PageSection background="light" className="py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#ED1C24]/10 rounded-full px-4 py-2 mb-4">
              <span className="text-[#ED1C24] text-sm font-semibold">For Artisans</span>
            </div>
            <h2 className="text-3xl font-black text-[#231F20] mb-3">Joining as a Tradesperson</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              How to register and start receiving matched job opportunities through Total Serve.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { step: 1, icon: "📝", title: "Register Your Trade", desc: "Complete the artisan registration form with your personal details, trade category, areas covered, qualifications and a short profile." },
              { step: 2, icon: "🔍", title: "Application Review", desc: "Our team reviews your registration. We verify qualifications, check public liability insurance and may contact your references." },
              { step: 3, icon: "✅", title: "Join the Internal Database", desc: "Once approved, you are added to the Total Serve artisan database. Your profile is visible internally to our team only." },
              { step: 4, icon: "💼", title: "Receive Matched Opportunities", desc: "When a customer enquiry matches your trade and area, we contact you with the details. You decide whether to take the job." },
            ].map((step) => (
              <div key={step.step} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#231F20] to-[#2E3192] flex items-center justify-center text-xl">
                    {step.icon}
                  </div>
                  <span className="text-xs font-bold text-[#ED1C24] uppercase tracking-wider">Step {step.step}</span>
                </div>
                <h3 className="font-black text-[#231F20] text-base mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/register-artisan">
              <Button variant="secondary" size="lg">Register as an Artisan →</Button>
            </Link>
          </div>
        </div>
      </PageSection>

      {/* FAQ link */}
      <PageSection background="white" className="py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-black text-[#231F20] mb-3">Still Have Questions?</h2>
          <p className="text-gray-500 mb-6">Visit our FAQ page for answers to the most common questions about Total Serve.</p>
          <Link href="/faq">
            <Button variant="outline" size="md">View FAQs</Button>
          </Link>
        </div>
      </PageSection>
    </>
  );
}
