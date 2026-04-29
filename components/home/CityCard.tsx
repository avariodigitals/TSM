import Link from "next/link";
import { City } from "@/lib/types";

interface CityCardProps {
  city: City;
  serviceCount?: number;
}

export default function CityCard({ city, serviceCount }: CityCardProps) {
  return (
    <Link href={`/cities/${city.slug}`} className="group block">
      <div className="glass-card-soft rounded-2xl p-4 min-[520px]:p-5 min-h-[136px] hover:-translate-y-0.5 hover:shadow-[0_22px_32px_-22px_rgba(0,44,90,0.46)] hover:border-[#00AEEF]/35 transition-all duration-300">
        <div className="mb-2 flex flex-col gap-2 min-[520px]:flex-row min-[520px]:items-center min-[520px]:justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl">📍</span>
            <h3 className="font-bold text-[#231F20] text-base min-[520px]:text-lg group-hover:text-[#00AEEF] transition-colors break-words">
              {city.name}
            </h3>
          </div>
          {serviceCount !== undefined && (
            <span className="inline-flex w-fit text-xs font-semibold bg-[#00AEEF]/10 text-[#00AEEF] px-2.5 py-1 rounded-full">
              {serviceCount} services
            </span>
          )}
        </div>
        <p className="text-gray-500 text-sm">{city.region}</p>
      </div>
    </Link>
  );
}
