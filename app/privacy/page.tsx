import PageSection from "@/components/ui/PageSection";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { getPageHeroContent } from "@/lib/page-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Read how Total Serve Maintenance Ltd collects, uses and protects personal information.",
};

const privacySections = [
  {
    title: "Information We Collect",
    body: [
      "When you submit an enquiry, register as an artisan, contact us, or use our website, we may collect details such as your name, email address, phone number, location, service requirements, trade details, qualifications, and messages you send to us.",
      "We may also collect basic technical information such as browser type, device information, pages visited, and general usage data to help us keep the website reliable and improve the experience.",
    ],
  },
  {
    title: "How We Use Information",
    body: [
      "We use personal information to respond to enquiries, review job requests, match customers with suitable tradespeople, assess artisan registrations, provide support, manage our records, and improve our services.",
      "We may also use information to send service-related updates, protect the website from misuse, meet legal obligations, and maintain the safety and quality of the Total Serve network.",
    ],
  },
  {
    title: "Sharing Information",
    body: [
      "We do not sell personal information. Where needed, we may share relevant enquiry details with vetted tradespeople so they can assess or carry out requested work.",
      "We may also share information with trusted service providers who help us operate the website, send communications, host systems, or manage administration. These parties should only use the information for the service they provide to us.",
    ],
  },
  {
    title: "Retention And Security",
    body: [
      "We keep personal information only for as long as needed for the purpose it was collected, including service delivery, record keeping, dispute handling, legal compliance, and business administration.",
      "We use reasonable technical and organisational measures to protect personal information, but no online system can be guaranteed to be completely secure.",
    ],
  },
  {
    title: "Your Choices",
    body: [
      "You may contact us to request access, correction, deletion, or restriction of your personal information, subject to any legal or operational requirements that apply.",
      "You can also ask questions about how your information is handled by contacting our team directly.",
    ],
  },
];

export default async function PrivacyPage() {
  const pageHero = await getPageHeroContent("privacy");

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
              This policy explains how Total Serve Maintenance Ltd handles information collected through this website and related enquiry services. It is intended as a clear service overview and should be reviewed alongside any specific notices we provide when collecting information.
            </p>
          </div>

          <div className="space-y-6">
            {privacySections.map((section) => (
              <div key={section.title} className="border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-black text-[#231F20] mb-3">{section.title}</h2>
                <div className="space-y-3">
                  {section.body.map((paragraph) => (
                    <p key={paragraph} className="text-gray-600 text-sm leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 bg-[#2E3192] rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-black mb-3">Questions About Your Data?</h2>
            <p className="text-blue-100 text-sm leading-relaxed mb-6">
              Contact the Total Serve team if you need help with a privacy request or want to understand how your details are used.
            </p>
            <Link href="/contact">
              <Button variant="red" size="md">Contact Us</Button>
            </Link>
          </div>
        </div>
      </PageSection>
    </>
  );
}
