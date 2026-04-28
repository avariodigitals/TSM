import Link from "next/link";
import HeroSearch from "@/components/home/HeroSearch";
import ServiceCard from "@/components/home/ServiceCard";
import CityCard from "@/components/home/CityCard";
import HowItWorks from "@/components/home/HowItWorks";
import TrustSection from "@/components/home/TrustSection";
import CTASection from "@/components/home/CTASection";
import FAQ from "@/components/home/FAQ";
import PageSection from "@/components/ui/PageSection";
import Button from "@/components/ui/Button";
import { faqs } from "@/lib/data";
import { getCatalogData } from "@/lib/catalog";
import { getHomeHeroContent } from "@/lib/page-content";

export default async function HomePage() {
  const { services, cities, mappings } = await getCatalogData();
  const homeHero = await getHomeHeroContent();

  const featuredServices = services.slice(0, 8);
  const featuredCities = cities.slice(0, 8);

  const cityWithCounts = featuredCities.map((city) => ({
    city,
    serviceCount: mappings.filter((m) => m.citySlug === city.slug).length,
  }));

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Total Serve Maintenance Ltd",
    url: "https://totalserve.co.uk",
    logo: "https://totalserve.co.uk/tml-logo.webp",
    areaServed: "United Kingdom",
    sameAs: [],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Total Serve Maintenance Ltd",
    url: "https://totalserve.co.uk",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://totalserve.co.uk/search?service={service}&city={city}",
      "query-input": ["required name=service", "required name=city"],
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <HeroSearch services={services} cities={cities} content={homeHero} />

      <PageSection background="white" id="services" className="py-16 lg:py-20 reveal-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#00AEEF]/10 rounded-full px-4 py-2 mb-4">
            <span className="text-[#00AEEF] text-sm font-semibold">What We Cover</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#231F20] mb-4">Popular Services</h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            From emergency repairs to planned maintenance, browse the trades we cover across the UK.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 reveal-stagger">
          {featuredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/services">
            <Button variant="outline" size="md">View All Services</Button>
          </Link>
        </div>
      </PageSection>

      <PageSection background="light" id="cities" className="py-16 lg:py-20 reveal-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#00AEEF]/10 rounded-full px-4 py-2 mb-4">
            <span className="text-[#00AEEF] text-sm font-semibold">UK Coverage</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#231F20] mb-4">Browse by City</h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            We currently serve these major UK cities with more being added regularly.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 reveal-stagger">
          {cityWithCounts.map(({ city, serviceCount }) => (
            <CityCard key={city.id} city={city} serviceCount={serviceCount} />
          ))}
        </div>
      </PageSection>

      <PageSection background="white" id="how-it-works" className="reveal-in">
        <HowItWorks />
      </PageSection>

      <PageSection background="light" className="py-12 lg:py-16 reveal-up">
        <CTASection variant="emergency" />
      </PageSection>

      <PageSection background="white" className="reveal-in">
        <TrustSection />
      </PageSection>

      <PageSection background="light" className="py-12 lg:py-16 reveal-up">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CTASection variant="enquiry" />
          <CTASection variant="artisan" />
        </div>
      </PageSection>

      <PageSection background="white" className="py-16 lg:py-24 reveal-in">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-[#00AEEF]/10 rounded-full px-4 py-2 mb-4">
              <span className="text-[#00AEEF] text-sm font-semibold">Common Questions</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#231F20] mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-500 text-lg">Everything you need to know about how Total Serve works.</p>
          </div>
          <div className="reveal-stagger">
            <FAQ items={faqs} maxVisible={5} />
          </div>
          <div className="text-center mt-8">
            <Link href="/faq">
              <Button variant="outline" size="md">View All FAQs</Button>
            </Link>
          </div>
        </div>
      </PageSection>
    </>
  );
}
