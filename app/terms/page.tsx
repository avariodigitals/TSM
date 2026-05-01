import PageSection from "@/components/ui/PageSection";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { getPageHeroContent } from "@/lib/page-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Read the terms that apply when using Total Serve Maintenance Ltd website and enquiry services.",
};

const termsSections = [
  {
    title: "Using Our Website",
    body: [
      "You may use this website to learn about Total Serve, browse services and cities, submit enquiries, contact our team, or apply to join the artisan network.",
      "You agree not to misuse the website, submit false information, interfere with its operation, attempt unauthorised access, or use it in a way that harms Total Serve, customers, artisans, or other users.",
    ],
  },
  {
    title: "Our Matching Service",
    body: [
      "Total Serve is not a public directory and does not provide direct booking through public artisan profiles. Enquiries are reviewed by our team before any suitable professional is suggested or assigned.",
      "Submitting an enquiry does not guarantee immediate availability, acceptance of the job, a fixed quote, or completion by a particular tradesperson.",
    ],
  },
  {
    title: "Customer Responsibilities",
    body: [
      "Customers should provide accurate job details, contact information, location information, and access requirements so our team can review the request properly.",
      "Any agreement for work, pricing, scheduling, site access, materials, or completion should be confirmed clearly with the tradesperson or business carrying out the work.",
    ],
  },
  {
    title: "Artisan Responsibilities",
    body: [
      "Artisans applying to join the network should provide accurate trade details, coverage areas, qualifications, insurance information, and contact details.",
      "Approval into the network is at Total Serve's discretion. Continued participation may depend on professionalism, reliability, compliance, and customer feedback.",
    ],
  },
  {
    title: "Website Content",
    body: [
      "Website content is provided for general information. We aim to keep information accurate and useful, but service coverage, availability, pricing, and operational details may change.",
      "The Total Serve name, branding, website copy, design, and materials belong to Total Serve Maintenance Ltd or its licensors and should not be copied or reused without permission.",
    ],
  },
  {
    title: "Changes To These Terms",
    body: [
      "We may update these terms from time to time to reflect changes to our services, website, operations, or legal requirements.",
      "The updated version will apply from the date it is published on this page.",
    ],
  },
];

export default async function TermsPage() {
  const pageHero = await getPageHeroContent("terms");

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
              These terms apply when you access or use the Total Serve Maintenance Ltd website and related online enquiry services. By using the website, you agree to use it responsibly and in line with these terms.
            </p>
          </div>

          <div className="space-y-6">
            {termsSections.map((section, index) => (
              <div key={section.title} className="flex gap-5 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#00AEEF] to-[#2E3192] text-white flex items-center justify-center font-black text-sm">
                  {index + 1}
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#231F20] mb-3">{section.title}</h2>
                  <div className="space-y-3">
                    {section.body.map((paragraph) => (
                      <p key={paragraph} className="text-gray-600 text-sm leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 bg-[#F5F7FA] rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-black text-[#231F20] mb-3">Need Clarification?</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Our team can help with questions about enquiries, registrations, or how Total Serve operates.
            </p>
            <Link href="/contact">
              <Button variant="primary" size="md">Contact Us</Button>
            </Link>
          </div>
        </div>
      </PageSection>
    </>
  );
}
