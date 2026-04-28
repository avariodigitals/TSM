import { notFound } from "next/navigation";
import { getCatalogData, getCityBySlug, getServicesForCity } from "@/lib/catalog";
import ServiceCard from "@/components/home/ServiceCard";
import PageSection from "@/components/ui/PageSection";
import Link from "next/link";
import Button from "@/components/ui/Button";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ citySlug: string }>;
}

export async function generateStaticParams() {
  const { cities } = await getCatalogData();
  return cities.map((c) => ({ citySlug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { citySlug } = await params;
  const city = await getCityBySlug(citySlug);
  if (!city) return {};
  return {
    title: `Tradespeople in ${city.name}`,
    description: `Find trusted tradespeople in ${city.name} through Total Serve. Submit an enquiry and we'll match you with the right professional.`,
  };
}

export default async function CityPage({ params }: Props) {
  const { citySlug } = await params;
  const city = await getCityBySlug(citySlug);
  if (!city) notFound();

  const availableServices = await getServicesForCity(citySlug);

  return (
    <>
      <div className="bg-gradient-to-br from-[#2E3192] to-[#1a1d6b] text-white py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-5xl mb-4">📍</div>
          <h1 className="text-4xl sm:text-5xl font-black mb-4">Tradespeople in {city.name}</h1>
          <p className="text-gray-300 text-lg">
            Browse the services Total Serve covers in {city.name}, {city.region}. Submit an enquiry and we&apos;ll match you with the right professional.
          </p>
        </div>
      </div>

      <PageSection background="white" className="py-14">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-[#231F20]">
                Available Services in {city.name}
              </h2>
              <p className="text-gray-500 text-sm mt-1">{availableServices.length} services currently available</p>
            </div>
            <Link href={`/enquiry?city=${citySlug}`}>
              <Button variant="red" size="sm">Submit Enquiry</Button>
            </Link>
          </div>

          {availableServices.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {availableServices.map((service) => (
                <ServiceCard key={service.id} service={service} citySlug={citySlug} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">No services currently mapped to this city.</p>
            </div>
          )}

          <div className="mt-12 bg-[#F5F7FA] rounded-2xl p-6 text-center">
            <h3 className="font-black text-[#231F20] text-lg mb-2">Can&apos;t see your service?</h3>
            <p className="text-gray-500 text-sm mb-5">
              Submit a general enquiry and our team will try to help, even if your specific service isn&apos;t listed for {city.name} yet.
            </p>
            <Link href={`/enquiry?city=${citySlug}`}>
              <Button variant="primary" size="md">Submit a General Enquiry</Button>
            </Link>
          </div>
        </div>
      </PageSection>
    </>
  );
}
