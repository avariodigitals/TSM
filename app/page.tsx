import Image from "next/image";
import Link from "next/link";
import { ContentStatus } from "@prisma/client";
import HeroSearch from "@/components/home/HeroSearch";
import ServiceCard from "@/components/home/ServiceCard";
import CityCard from "@/components/home/CityCard";
import HowItWorks from "@/components/home/HowItWorks";
import TrustSection from "@/components/home/TrustSection";
import CTASection from "@/components/home/CTASection";
import FAQ from "@/components/home/FAQ";
import PageSection from "@/components/ui/PageSection";
import Button from "@/components/ui/Button";
import { getExcerptFromBody, getFirstImageFromBody } from "@/components/content/BlogRichText";
import { faqs } from "@/lib/data";
import { getCatalogData } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { getHomeHeroContent, getHomeSectionsContent } from "@/lib/page-content";
import { getSettingValue } from "@/lib/site-settings";

export default async function HomePage() {
  const { services, cities, mappings } = await getCatalogData();
  const homeHero = await getHomeHeroContent();
  const homeSections = await getHomeSectionsContent();
  const imagesBySlug = await getSettingValue<Record<string, string>>("content.imagesBySlug", {});

  let latestPosts: Array<{
    id: string;
    slug: string;
    title: string;
    summary: string | null;
    body: string;
    publishedAt: Date | null;
    updatedAt: Date;
  }> = [];

  try {
    latestPosts = await prisma.contentEntry.findMany({
      where: { status: ContentStatus.PUBLISHED },
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
      take: 3,
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        body: true,
        publishedAt: true,
        updatedAt: true,
      },
    });
  } catch {
    latestPosts = [];
  }

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
            <span className="text-[#00AEEF] text-sm font-semibold">{homeSections.services.badge}</span>
          </div>
          <h2 className="text-[1.85rem] min-[520px]:text-3xl sm:text-4xl font-black text-[#231F20] mb-4">{homeSections.services.title}</h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            {homeSections.services.subtitle}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 reveal-stagger">
          {featuredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/services">
            <Button variant="outline" size="md">{homeSections.services.buttonLabel}</Button>
          </Link>
        </div>
      </PageSection>

      <PageSection background="light" id="cities" className="py-16 lg:py-20 reveal-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#00AEEF]/10 rounded-full px-4 py-2 mb-4">
            <span className="text-[#00AEEF] text-sm font-semibold">{homeSections.cities.badge}</span>
          </div>
          <h2 className="text-[1.85rem] min-[520px]:text-3xl sm:text-4xl font-black text-[#231F20] mb-4">{homeSections.cities.title}</h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            {homeSections.cities.subtitle}
          </p>
        </div>
        <div className="grid grid-cols-1 min-[520px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 reveal-stagger">
          {cityWithCounts.map(({ city, serviceCount }) => (
            <CityCard key={city.id} city={city} serviceCount={serviceCount} />
          ))}
        </div>
      </PageSection>

      <PageSection background="white" id="how-it-works" className="reveal-in">
        <HowItWorks content={homeSections.howItWorks} />
      </PageSection>

      <PageSection background="light" className="py-12 lg:py-16 reveal-up">
        <CTASection
          variant="emergency"
          heading={homeSections.emergencyCta.heading}
          subtext={homeSections.emergencyCta.subtext}
        />
      </PageSection>

      <PageSection background="white" className="reveal-in">
        <TrustSection content={homeSections.trust} />
      </PageSection>

      <PageSection background="light" className="py-12 lg:py-16 reveal-up">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CTASection
            variant="enquiry"
            heading={homeSections.enquiryCta.heading}
            subtext={homeSections.enquiryCta.subtext}
          />
          <CTASection
            variant="artisan"
            heading={homeSections.artisanCta.heading}
            subtext={homeSections.artisanCta.subtext}
          />
        </div>
      </PageSection>

      {latestPosts.length > 0 ? (
        <PageSection background="white" className="py-16 lg:py-20 reveal-in">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-[#00AEEF]/10 rounded-full px-4 py-2 mb-4">
              <span className="text-[#00AEEF] text-sm font-semibold">{homeSections.blog.badge}</span>
            </div>
            <h2 className="text-[1.85rem] min-[520px]:text-3xl sm:text-4xl font-black text-[#231F20] mb-4">{homeSections.blog.title}</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">{homeSections.blog.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {latestPosts.map((post) => (
              <article key={post.id} className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                <Link href={`/blog/${post.slug}`} className="block">
                  {imagesBySlug[post.slug] || getFirstImageFromBody(post.body) ? (
                    <div className="relative h-48 w-full bg-gray-100">
                      <Image
                        src={imagesBySlug[post.slug] || getFirstImageFromBody(post.body) || "/placeholder.webp"}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="h-48 w-full bg-gradient-to-br from-[#eef6ff] to-[#f6fbff]" />
                  )}
                </Link>
                <div className="p-5">
                  <h3 className="text-xl font-black text-[#231F20] leading-tight mb-2">
                    <Link href={`/blog/${post.slug}`} className="hover:text-[#00AEEF] transition-colors">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                    {getExcerptFromBody(post.summary || post.body, "Read the full article for more details.").slice(0, 180)}
                  </p>
                </div>
              </article>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/blog">
              <Button variant="outline" size="md">{homeSections.blog.buttonLabel}</Button>
            </Link>
          </div>
        </PageSection>
      ) : null}

      <PageSection background="white" className="py-16 lg:py-24 reveal-in">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-[#00AEEF]/10 rounded-full px-4 py-2 mb-4">
              <span className="text-[#00AEEF] text-sm font-semibold">{homeSections.faq.badge}</span>
            </div>
            <h2 className="text-[1.85rem] min-[520px]:text-3xl sm:text-4xl font-black text-[#231F20] mb-4">
              {homeSections.faq.title}
            </h2>
            <p className="text-gray-500 text-lg">{homeSections.faq.subtitle}</p>
          </div>
          <div className="reveal-stagger">
            <FAQ items={faqs} maxVisible={5} />
          </div>
          <div className="text-center mt-8">
            <Link href="/faq">
              <Button variant="outline" size="md">{homeSections.faq.buttonLabel}</Button>
            </Link>
          </div>
        </div>
      </PageSection>
    </>
  );
}
