import Link from "next/link";
import { Service } from "@/lib/types";

interface ServiceCardProps {
  service: Service;
  showLink?: boolean;
  citySlug?: string;
}

export default function ServiceCard({ service, showLink = true, citySlug }: ServiceCardProps) {
  const href = citySlug
    ? `/services/${service.slug}/${citySlug}`
    : `/services/${service.slug}`;

  return (
    <Link href={href} className="group block">
      <div className="glass-card-soft rounded-2xl p-5 min-[520px]:p-6 min-h-[170px] hover:-translate-y-1 hover:shadow-[0_24px_35px_-24px_rgba(0,44,90,0.5)] hover:border-[#00AEEF]/35 transition-all duration-300 h-full">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/65 border border-white/70 flex items-center justify-center text-2xl group-hover:bg-[#00AEEF]/10 transition-colors">
            {service.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[#231F20] text-base min-[520px]:text-lg mb-1 group-hover:text-[#00AEEF] transition-colors">
              {service.name}
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
              {service.shortDescription}
            </p>
          </div>
        </div>
        {showLink && (
          <div className="mt-4 text-[#00AEEF] text-sm font-semibold group-hover:gap-2 flex items-center gap-1 transition-all">
            Learn more
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </div>
    </Link>
  );
}
