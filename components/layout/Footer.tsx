import Image from "next/image";
import Link from "next/link";
import type { City, Service } from "@/lib/types";

const companyLinks = [
  { href: "/about", label: "About Total Serve" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/register-artisan", label: "Register as Artisan" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact Us" },
];

export default function Footer({
  logoUrl,
  companyBlurb,
  supportEmail,
  supportPhone,
  services,
  cities,
}: {
  logoUrl: string;
  companyBlurb: string;
  supportEmail: string;
  supportPhone: string;
  services: Service[];
  cities: City[];
}) {
  const topServices = services.slice(0, 6);
  const topCities = cities.slice(0, 8);

  return (
    <footer className="bg-[#231F20] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <Image
                src={logoUrl || "/tml-logo.webp"}
                alt="Total Serve Maintenance Ltd"
                width={168}
                height={48}
                className="h-10 w-auto"
              />
              <div>
                <div className="font-black text-white text-lg leading-none">Total Serve</div>
                <div className="text-[10px] text-[#00AEEF] font-semibold uppercase tracking-widest leading-none">
                  Maintenance Ltd
                </div>
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              {companyBlurb}
            </p>
            <div className="text-sm text-gray-500 space-y-1">
              <div className="flex items-center gap-2">
                <span>📍</span>
                <span>United Kingdom</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📧</span>
                <span>{supportEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📞</span>
                <span>{supportPhone}</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4">
              Our Services
            </h4>
            <ul className="space-y-2">
              {topServices.map((service) => (
                <li key={service.id}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="text-gray-400 hover:text-[#00AEEF] text-sm transition-colors"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/services" className="text-[#00AEEF] text-sm font-medium hover:underline">
                  View all services →
                </Link>
              </li>
            </ul>
          </div>

          {/* Cities */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4">
              Cities We Cover
            </h4>
            <ul className="space-y-2">
              {topCities.map((city) => (
                <li key={city.id}>
                  <Link
                    href={`/cities/${city.slug}`}
                    className="text-gray-400 hover:text-[#00AEEF] text-sm transition-colors"
                  >
                    {city.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-[#00AEEF] text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 p-4 rounded-xl bg-[#2E3192]/40 border border-[#2E3192]">
              <p className="text-xs text-gray-300 mb-2 font-semibold">Need help urgently?</p>
              <Link
                href="/enquiry?urgency=emergency"
                className="inline-block text-xs font-bold text-white bg-[#ED1C24] hover:bg-[#c91920] px-3 py-2 rounded-lg transition-colors"
              >
                🚨 Submit Emergency Enquiry
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} Total Serve Maintenance Ltd. All rights reserved.
          </p>
          <p className="text-xs text-gray-500">
            Developed by{" "}
            <a
              href="https://www.avariodigitals.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00AEEF] hover:underline"
            >
              Avario Digitals
            </a>
          </p>
          <div className="flex gap-4 text-xs text-gray-500">
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-300 transition-colors">Terms of Use</Link>
            <Link href="/cookies" className="hover:text-gray-300 transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
