import { getCatalogData } from "@/lib/catalog";
import CityCard from "@/components/home/CityCard";
import PageSection from "@/components/ui/PageSection";
import { getPageHeroContent } from "@/lib/page-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cities We Cover",
  description: "Browse all UK cities where Total Serve provides maintenance and tradesperson services.",
};

export default async function CitiesPage() {
  const { cities, mappings } = await getCatalogData();
  const pageHero = await getPageHeroContent("cities");

  const cityWithCounts = cities.map((city) => ({
    city,
    serviceCount: mappings.filter((m) => m.citySlug === city.slug).length,
  }));

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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {cityWithCounts.map(({ city, serviceCount }) => (
            <CityCard key={city.id} city={city} serviceCount={serviceCount} />
          ))}
        </div>
      </PageSection>
    </>
  );
}
