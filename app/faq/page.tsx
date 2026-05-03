import FAQ from "@/components/home/FAQ";
import { faqs } from "@/lib/data";
import PageSection from "@/components/ui/PageSection";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { getPageHeroContent } from "@/lib/page-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about Totalserve Maintenance Ltd.",
};

export default async function FAQPage() {
  const pageHero = await getPageHeroContent("faq");
  const customerFaqs = faqs.filter((f) => f.category !== "artisans");
  const artisanFaqs = faqs.filter((f) => f.category === "artisans");

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
        <div className="max-w-3xl mx-auto space-y-14">
          <div>
            <h2 className="text-2xl font-black text-[#231F20] mb-6">For Customers</h2>
            <FAQ items={customerFaqs} showAll />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#231F20] mb-6">For Artisans & Tradespeople</h2>
            <FAQ items={artisanFaqs} showAll />
          </div>

          <div className="bg-[#F5F7FA] rounded-2xl p-8 text-center">
            <h3 className="text-xl font-black text-[#231F20] mb-3">Still Have a Question?</h3>
            <p className="text-gray-500 mb-6">If your question isn&apos;t answered here, get in touch with our team directly.</p>
            <Link href="/contact">
              <Button variant="primary" size="md">Contact Us</Button>
            </Link>
          </div>
        </div>
      </PageSection>
    </>
  );
}
