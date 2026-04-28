import PageSection from "@/components/ui/PageSection";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { getPageHeroContent } from "@/lib/page-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Total Serve",
  description: "Learn about Total Serve Maintenance Ltd — connecting people across the UK with trusted tradespeople.",
};

export default async function AboutPage() {
  const pageHero = await getPageHeroContent("about");

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

      <PageSection background="white" className="py-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#00AEEF]/10 rounded-full px-4 py-2 mb-5">
                <span className="text-[#00AEEF] text-sm font-semibold">Our Mission</span>
              </div>
              <h2 className="text-3xl font-black text-[#231F20] mb-5 leading-tight">
                Connecting People with the Right Professionals
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Total Serve Maintenance Ltd was founded with a clear purpose: to make it easy for homeowners, landlords and businesses across the UK to find trusted, qualified tradespeople — without the hassle of trawling through directories, chasing quotes, or taking a risk on an unknown contractor.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                We operate differently from a booking marketplace. Instead of letting users directly browse and book artisans, our team reviews every enquiry and manually assigns the most suitable professional based on the specific job, location and requirements.
              </p>
              <p className="text-gray-600 leading-relaxed">
                This approach ensures quality, consistency and a better experience for both customers and tradespeople.
              </p>
            </div>
            <div className="bg-[#F5F7FA] rounded-3xl p-10 flex items-center justify-center">
              <div className="text-center">
                <div className="flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-[#00AEEF] to-[#2E3192] text-white font-black text-3xl shadow-xl mx-auto mb-5">
                  TML
                </div>
                <div className="font-black text-[#2E3192] text-2xl">Total Serve</div>
                <div className="text-[#00AEEF] text-sm font-semibold uppercase tracking-widest mt-1">Maintenance Ltd</div>
                <div className="text-gray-400 text-xs mt-2">Gas &amp; Electric · And More</div>
              </div>
            </div>
          </div>

          {/* Values */}
          <div>
            <h2 className="text-2xl font-black text-[#231F20] mb-7 text-center">Our Values</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                { icon: "🔐", title: "Trust", desc: "Every artisan in our network is vetted. We don&apos;t compromise on the quality and reliability of the professionals we recommend." },
                { icon: "🎯", title: "Precision", desc: "We don&apos;t send generic responses. Every match is reviewed by our team to ensure the right fit for your specific job." },
                { icon: "🤝", title: "Service", desc: "We are a service business at heart. Our goal is to make your experience smooth, reassuring and effective from first enquiry to completion." },
              ].map((v) => (
                <div key={v.title} className="bg-[#F5F7FA] rounded-2xl p-6 text-center">
                  <div className="text-4xl mb-4">{v.icon}</div>
                  <h3 className="font-black text-[#231F20] text-base mb-2">{v.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: v.desc }} />
                </div>
              ))}
            </div>
          </div>

          {/* What we are not */}
          <div className="mt-14 bg-[#F5F7FA] rounded-3xl p-8">
            <h2 className="text-xl font-black text-[#231F20] mb-4">What Total Serve Is Not</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              We want to be transparent about how we operate.
            </p>
            <ul className="space-y-2.5 text-sm text-gray-600">
              {[
                "We are not a directory where you browse and directly contact artisans.",
                "We do not publicly display artisan phone numbers or profiles.",
                "We do not allow direct booking without our review process.",
                "We do not guarantee immediate availability — but we respond fast.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="text-[#ED1C24] font-bold mt-0.5">✗</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-12 text-center">
            <Link href="/enquiry">
              <Button variant="red" size="lg">Submit an Enquiry</Button>
            </Link>
          </div>
        </div>
      </PageSection>
    </>
  );
}
