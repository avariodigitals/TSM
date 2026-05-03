import { getCatalogData } from "@/lib/catalog";
import ServiceCard from "@/components/home/ServiceCard";
import PageSection from "@/components/ui/PageSection";
import { getPageHeroContent } from "@/lib/page-content";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Services",
  description: "Browse all maintenance services offered by Totalserve across the UK.",
};

export default async function ServicesPage() {
  const { services, mappings, cities } = await getCatalogData();
  const pageHero = await getPageHeroContent("services");

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {services.map((service) => {
            const cityCount = mappings.filter((m) => m.serviceSlug === service.slug).length;
            return (
              <div key={service.id} className="relative">
                <ServiceCard service={service} />
                <div className="mt-1 text-xs text-gray-400 text-center">
                  Available in {cityCount} {cityCount === 1 ? "city" : "cities"}
                </div>
              </div>
            );
          })}
        </div>
      </PageSection>

      {/* Service × City grid */}
      <PageSection background="light" className="py-14">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black text-[#231F20] mb-3">Services by City</h2>
          <p className="text-gray-500">Find a specific service in your city.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#2E3192] text-white">
                <th className="px-4 py-3 text-left font-semibold rounded-tl-xl">Service</th>
                {cities.slice(0, 6).map((c) => (
                  <th key={c.id} className="px-3 py-3 text-center font-semibold">{c.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {services.map((service, i) => (
                <tr key={service.id} className={i % 2 === 0 ? "bg-white" : "bg-[#F5F7FA]"}>
                  <td className="px-4 py-3 font-semibold text-[#231F20]">
                    {service.icon} {service.name}
                  </td>
                  {cities.slice(0, 6).map((city) => {
                    const available = mappings.some(
                      (m) => m.serviceSlug === service.slug && m.citySlug === city.slug
                    );
                    return (
                      <td key={city.id} className="px-3 py-3 text-center">
                        {available ? (
                          <Link
                            href={`/services/${service.slug}/${city.slug}`}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#00AEEF]/10 hover:bg-[#00AEEF] hover:text-white transition-colors group"
                            title={`${service.name} in ${city.name}`}
                          >
                            <svg className="w-3.5 h-3.5 text-[#00AEEF] group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </Link>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageSection>
    </>
  );
}
