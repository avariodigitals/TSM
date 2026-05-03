import Link from "next/link";
import {
  getServiceBySlug,
  getCityBySlug,
  isMappingAvailable,
  getServicesForCity,
} from "@/lib/catalog";
import Button from "@/components/ui/Button";
import ServiceCard from "@/components/home/ServiceCard";
import PageSection from "@/components/ui/PageSection";
import { getPageHeroContent } from "@/lib/page-content";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; city?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const serviceSlug = resolvedSearchParams.service || "";
  const citySlug = resolvedSearchParams.city || "";

  const service = serviceSlug ? await getServiceBySlug(serviceSlug) : undefined;
  const city = citySlug ? await getCityBySlug(citySlug) : undefined;
  const hasMapping = service && city ? await isMappingAvailable(serviceSlug, citySlug) : false;
  const relatedServices = city ? (await getServicesForCity(citySlug)).filter((s) => s.slug !== serviceSlug).slice(0, 4) : [];
  const pageHeroTemplate = await getPageHeroContent("search");
  const pageHeroTitle = pageHeroTemplate.title
    .replace("{service}", service?.name ?? "Service")
    .replace("{city}", city?.name ?? "your city");
  const pageHeroSubtitle = pageHeroTemplate.subtitle
    .replace("{service}", service?.name ?? "service")
    .replace("{city}", city?.name ?? "your city");

  if (!serviceSlug && !citySlug) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🔍</div>
        <h1 className="text-2xl font-black text-[#231F20] mb-3">{pageHeroTitle}</h1>
        <p className="text-gray-500 mb-6">{pageHeroSubtitle}</p>
        <Link href="/">
          <Button variant="primary">Back to Home</Button>
        </Link>
      </div>
    );
  }

  if (hasMapping && service && city) {
    return (
      <>
        <div className="bg-gradient-to-br from-[#2E3192] to-[#1a1d6b] text-white py-14 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-[#00AEEF]/20 border border-[#00AEEF]/30 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-[#00AEEF] text-sm font-semibold">Service Available</span>
            </div>
            <div className="text-5xl mb-4">{service.icon}</div>
            <h1 className="text-4xl sm:text-5xl font-black mb-4">
              {pageHeroTitle}
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              {pageHeroSubtitle}
            </p>
          </div>
        </div>

        <PageSection background="white" className="py-12">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-[#F5F7FA] rounded-2xl p-6">
                  <h2 className="font-black text-[#231F20] text-xl mb-3">About This Service</h2>
                  <p className="text-gray-600 leading-relaxed">{service.description}</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="font-black text-[#231F20] text-xl mb-4">Common Issues We Handle</h2>
                  <ul className="space-y-2">
                    {service.commonIssues.map((issue) => (
                      <li key={issue} className="flex items-center gap-3 text-gray-600 text-sm">
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
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-br from-[#2E3192] to-[#1a1d6b] rounded-2xl p-6 text-white sticky top-24">
                  <h3 className="font-black text-lg mb-2">Ready to get help?</h3>
                  <p className="text-gray-300 text-sm mb-5">
                    Submit an enquiry and Totalserve will assign the right {service.name.toLowerCase()} in {city.name}.
                  </p>
                  <Link href={`/enquiry?service=${serviceSlug}&city=${citySlug}`}>
                    <Button variant="red" size="md" fullWidth>
                      Submit Enquiry →
                    </Button>
                  </Link>
                </div>

                <div className="bg-[#F5F7FA] rounded-2xl p-5 border border-gray-100">
                  <h4 className="font-bold text-[#231F20] text-sm mb-3">📍 Location</h4>
                  <p className="text-gray-600 text-sm">{city.description}</p>
                </div>
              </div>
            </div>

            {relatedServices.length > 0 ? (
              <div className="mt-12">
                <h2 className="font-black text-[#231F20] text-xl mb-5">Other Services in {city.name}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {relatedServices.map((relatedService) => (
                    <ServiceCard key={relatedService.id} service={relatedService} citySlug={citySlug} />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </PageSection>
      </>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-br from-[#231F20] to-[#2E3192] text-white py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-400/20 border border-yellow-400/30 rounded-full px-4 py-2 mb-6">
            <span className="text-yellow-400 text-sm font-semibold">Service Not Yet Available</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-4">
            {pageHeroTitle}
          </h1>
          <p className="text-gray-300 text-lg">
            {pageHeroSubtitle}
          </p>
        </div>
      </div>

      <PageSection background="white" className="py-14">
        <div className="max-w-xl mx-auto text-center">
          <div className="text-5xl mb-5">🗺️</div>
          <h2 className="text-2xl font-black text-[#231F20] mb-3">We&apos;re Growing</h2>
          <p className="text-gray-500 leading-relaxed mb-8">
            Totalserve is continually expanding our artisan network across the UK. If your area isn&apos;t listed, submit a general enquiry and we&apos;ll try to accommodate your request or notify you when coverage arrives.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/enquiry">
              <Button variant="red" size="md">Submit a General Enquiry</Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="md">Contact Us</Button>
            </Link>
          </div>
        </div>
      </PageSection>
    </>
  );
}
