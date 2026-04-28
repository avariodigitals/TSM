import { notFound } from "next/navigation";
import { getCatalogData, getServiceBySlug, getCitiesForService } from "@/lib/catalog";
import PageSection from "@/components/ui/PageSection";
import Link from "next/link";
import Button from "@/components/ui/Button";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ serviceSlug: string }>;
}

export async function generateStaticParams() {
  const { services } = await getCatalogData();
  return services.map((s) => ({ serviceSlug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { serviceSlug } = await params;
  const service = await getServiceBySlug(serviceSlug);
  if (!service) return {};
  return {
    title: `${service.name} Services`,
    description: service.description,
  };
}

export default async function ServicePage({ params }: Props) {
  const { serviceSlug } = await params;
  const service = await getServiceBySlug(serviceSlug);
  if (!service) notFound();

  const availableCities = await getCitiesForService(serviceSlug);

  return (
    <>
      <div className="bg-gradient-to-br from-[#2E3192] to-[#1a1d6b] text-white py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-6xl mb-4">{service.icon}</div>
          <h1 className="text-4xl sm:text-5xl font-black mb-4">{service.name} Services</h1>
          <p className="text-gray-300 text-lg">{service.shortDescription}</p>
        </div>
      </div>

      <PageSection background="white" className="py-14">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-black text-[#231F20] mb-3">About This Service</h2>
              <p className="text-gray-600 leading-relaxed">{service.description}</p>
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#231F20] mb-4">Common Issues We Handle</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {service.commonIssues.map((issue) => (
                  <li key={issue} className="flex items-center gap-3 text-gray-600 text-sm bg-[#F5F7FA] rounded-xl px-4 py-3">
                    <span className="text-[#00AEEF] font-bold">✓</span>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <div className="bg-gradient-to-br from-[#2E3192] to-[#1a1d6b] rounded-2xl p-6 text-white sticky top-24">
              <h3 className="font-black text-lg mb-2">Need a {service.name}?</h3>
              <p className="text-gray-300 text-sm mb-5">Submit an enquiry and we&apos;ll match you with a trusted professional.</p>
              <Link href={`/enquiry?service=${service.slug}`}>
                <Button variant="red" size="md" fullWidth>Submit Enquiry →</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Available cities */}
        <div className="max-w-4xl mx-auto mt-12">
          <h2 className="text-2xl font-black text-[#231F20] mb-5">
            Cities Where We Offer {service.name} Services
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {availableCities.map((city) => (
              <Link
                key={city.id}
                href={`/services/${service.slug}/${city.slug}`}
                className="group flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm hover:border-[#00AEEF]/30 hover:shadow-md transition-all"
              >
                <span className="text-sm">📍</span>
                <span className="font-semibold text-[#231F20] text-sm group-hover:text-[#00AEEF] transition-colors">
                  {city.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </PageSection>
    </>
  );
}
