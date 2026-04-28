import Link from "next/link";
import { City } from "@/lib/types";

interface CityCardProps {
  city: City;
  serviceCount?: number;
}

export default function CityCard({ city, serviceCount }: CityCardProps) {
  return (
    <Link href={`/cities/${city.slug}`} className="group block">
      <div className="glass-card-soft rounded-2xl p-5 hover:-translate-y-0.5 hover:shadow-[0_22px_32px_-22px_rgba(0,44,90,0.46)] hover:border-[#00AEEF]/35 transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">📍</span>
            <h3 className="font-bold text-[#231F20] text-base group-hover:text-[#00AEEF] transition-colors">
              {city.name}
            </h3>
          </div>
          {serviceCount !== undefined && (
            <span className="text-xs font-semibold bg-[#00AEEF]/10 text-[#00AEEF] px-2.5 py-1 rounded-full">
              {serviceCount} services
            </span>
          )}
        </div>
        <p className="text-gray-500 text-sm">{city.region}</p>
      </div>
    </Link>
  );
}
