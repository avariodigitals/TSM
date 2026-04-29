import { notFound } from "next/navigation";
import {
  getCatalogData,
  getServiceBySlug,
  getCityBySlug,
  isMappingAvailable,
  getServicesForCity,
  getCitiesForService,
} from "@/lib/catalog";
import PageSection from "@/components/ui/PageSection";
import ServiceCard from "@/components/home/ServiceCard";
import Link from "next/link";
import Button from "@/components/ui/Button";
import type { Metadata } from "next";
import { getPageHeroContent } from "@/lib/page-content";

interface Props {
  params: Promise<{ serviceSlug: string; citySlug: string }>;
}

export async function generateStaticParams() {
  const { mappings } = await getCatalogData();
  return mappings.map((m) => ({
    serviceSlug: m.serviceSlug,
    citySlug: m.citySlug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { serviceSlug, citySlug } = await params;
  const service = await getServiceBySlug(serviceSlug);
  const city = await getCityBySlug(citySlug);
  if (!service || !city) return {};
  return {
    title: `${service.name}s in ${city.name}`,
    description: `Find trusted ${service.name.toLowerCase()}s in ${city.name} through Total Serve. Submit an enquiry and we'll match you with the right professional.`,
  };
}

export default async function ServiceCityPage({ params }: Props) {
  const { serviceSlug, citySlug } = await params;
  const service = await getServiceBySlug(serviceSlug);
  const city = await getCityBySlug(citySlug);

  if (!service || !city || !(await isMappingAvailable(serviceSlug, citySlug))) {
    notFound();
  }

  const pageHeroTemplate = await getPageHeroContent("serviceCity");
  const pageHeroTitle = pageHeroTemplate.title.replace("{service}", service.name).replace("{city}", city.name);
  const pageHeroSubtitle = pageHeroTemplate.subtitle
    .replace("{service}", service.name.toLowerCase())
    .replace("{city}", city.name);

  const relatedServices = (await getServicesForCity(citySlug))
    .filter((s) => s.slug !== serviceSlug)
    .slice(0, 4);

  const nearbyCities = (await getCitiesForService(serviceSlug))
    .filter((c) => c.slug !== citySlug)
    .slice(0, 6);

  return (
    <>
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#2E3192] via-[#1a1d6b] to-[#231F20] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#00AEEF]/20 border border-[#00AEEF]/30 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-[#00AEEF] text-sm font-semibold">Available in {city.name}</span>
          </div>
          <div className="text-5xl mb-4">{service.icon}</div>
          <h1 className="text-4xl sm:text-5xl font-black mb-4">
            {pageHeroTitle}
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            {pageHeroSubtitle}
          </p>
          <div className="mt-8">
            <Link href={`/enquiry?service=${serviceSlug}&city=${citySlug}`}>
              <Button variant="red" size="lg">Submit Enquiry for {city.name} →</Button>
            </Link>
          </div>
        </div>
      </div>

      <PageSection background="white" className="py-14">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main */}
          <div className="lg:col-span-2 space-y-7">
            <div className="bg-[#F5F7FA] rounded-2xl p-6">
              <h2 className="text-xl font-black text-[#231F20] mb-3">
                {service.name} Services in {city.name}
              </h2>
              <p className="text-gray-600 leading-relaxed">{service.description}</p>
              <p className="text-gray-600 leading-relaxed mt-3">
                {city.description} Total Serve maintains a database of vetted {service.name.toLowerCase()}s serving this area, reviewed for qualifications, insurance and reliability.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-[#231F20] mb-4">Common Issues We Handle in {city.name}</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {service.commonIssues.map((issue) => (
                  <li key={issue} className="flex items-center gap-3 text-gray-600 text-sm bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
                    <span className="w-5 h-5 rounded-full bg-[#00AEEF]/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-[#00AEEF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-black text-[#231F20] mb-4">How the Enquiry Process Works</h2>
              <ol className="space-y-4">
                {[
                  { title: "Submit Your Enquiry", desc: `Complete our short enquiry form with your job details, address in ${city.name}, and preferred contact method.` },
                  { title: "Total Serve Reviews", desc: `Our team reviews your request and identifies the best-matched ${service.name.toLowerCase()} from our vetted ${city.name} database.` },
                  { title: "We Confirm the Match", desc: "You receive confirmation of the professional we've matched to your job, along with next steps." },
                  { title: "Job Gets Done", desc: `The ${service.name.toLowerCase()} contacts you directly to discuss your requirements and arrange the work.` },
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00AEEF] to-[#2E3192] text-white text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <div>
                      <div className="font-bold text-[#231F20] text-sm">{step.title}</div>
                      <div className="text-gray-500 text-sm mt-0.5 leading-relaxed">{step.desc}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-[#2E3192] to-[#1a1d6b] rounded-2xl p-6 text-white sticky top-24">
              <h3 className="font-black text-lg mb-2">Ready to Get Help?</h3>
              <p className="text-gray-300 text-sm mb-5">
                Submit an enquiry for a {service.name.toLowerCase()} in {city.name}. We&apos;ll review and respond within 2–4 hours.
              </p>
              <Link href={`/enquiry?service=${serviceSlug}&city=${citySlug}`}>
                <Button variant="red" size="md" fullWidth>Submit Enquiry →</Button>
              </Link>
              <div className="mt-4 pt-4 border-t border-white/10 space-y-2 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <span>✅</span> Free to submit
                </div>
                <div className="flex items-center gap-2">
                  <span>🔒</span> Vetted professionals only
                </div>
                <div className="flex items-center gap-2">
                  <span>⚡</span> 2–4 hour response time
                </div>
              </div>
            </div>

            {nearbyCities.length > 0 && (
              <div className="bg-[#F5F7FA] rounded-2xl p-5 border border-gray-100">
                <h4 className="font-bold text-[#231F20] text-sm mb-3">
                  {service.name}s in Other Cities
                </h4>
                <div className="flex flex-wrap gap-2">
                  {nearbyCities.map((c) => (
                    <Link
                      key={c.id}
                      href={`/services/${serviceSlug}/${c.slug}`}
                      className="text-xs font-medium text-[#2E3192] bg-white border border-[#2E3192]/20 rounded-full px-3 py-1 hover:bg-[#2E3192] hover:text-white transition-colors"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related services */}
        {relatedServices.length > 0 && (
          <div className="max-w-5xl mx-auto mt-14">
            <h2 className="text-xl font-black text-[#231F20] mb-5">
              Other Services Available in {city.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedServices.map((s) => (
                <ServiceCard key={s.id} service={s} citySlug={citySlug} />
              ))}
            </div>
          </div>
        )}
      </PageSection>
    </>
  );
}
