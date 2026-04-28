"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Service, City } from "@/lib/types";
import Button from "@/components/ui/Button";
import Link from "next/link";

interface HomeHeroContent {
  badge: string;
  titlePrefix: string;
  titleHighlight: string;
  titleSuffix: string;
  subtitle: string;
  mediaMode?: "none" | "image" | "slides";
  mediaImageUrl?: string;
  mediaSlides?: string[];
}

export default function HeroSearch({
  services,
  cities,
  content,
}: {
  services: Service[];
  cities: City[];
  content: HomeHeroContent;
}) {
  const router = useRouter();
  const [serviceSlug, setServiceSlug] = useState("");
  const [citySlug, setCitySlug] = useState("");
  const [slideIndex, setSlideIndex] = useState(0);

  const slides = content.mediaSlides?.filter(Boolean) ?? [];
  const hasSlides = content.mediaMode === "slides" && slides.length > 0;
  const activeSlide = hasSlides ? slides[slideIndex % slides.length] : "";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (serviceSlug && citySlug) {
      router.push(`/search?service=${serviceSlug}&city=${citySlug}`);
    } else {
      router.push(`/search?service=${serviceSlug}&city=${citySlug}`);
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-[#2E3192] via-[#1a1d6b] to-[#231F20] overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #00AEEF 0%, transparent 50%), radial-gradient(circle at 75% 75%, #00AEEF 0%, transparent 50%)`,
          }}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/25" />
      <div className="absolute -bottom-24 left-1/2 h-56 w-[120%] -translate-x-1/2 rounded-[100%] bg-white/10 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 reveal-in">
        <div className="max-w-3xl mx-auto text-center reveal-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#00AEEF]/20 border border-[#00AEEF]/30 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#00AEEF] animate-pulse" />
            <span className="text-[#00AEEF] text-sm font-semibold">{content.badge}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
            {content.titlePrefix}{" "}
            <span className="text-[#00AEEF]">{content.titleHighlight}</span>
            <br />
            {content.titleSuffix}
          </h1>

          <p className="text-gray-300 text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
            {content.subtitle}
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="hero-search-glow glass-card rounded-2xl p-3 flex flex-col sm:flex-row gap-3 reveal-up">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 pt-2 pb-1 text-left">
                Service Needed
              </label>
              <select
                value={serviceSlug}
                onChange={(e) => setServiceSlug(e.target.value)}
                className="w-full px-3 pb-2 text-[#231F20] text-base bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="">Select a service...</option>
                {services.map((s) => (
                  <option key={s.id} value={s.slug}>
                    {s.icon} {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden sm:block w-px bg-gray-200 my-2" />

            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 pt-2 pb-1 text-left">
                Your City / Location
              </label>
              <select
                value={citySlug}
                onChange={(e) => setCitySlug(e.target.value)}
                className="w-full px-3 pb-2 text-[#231F20] text-base bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="">Select a city...</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.slug}>
                    📍 {c.name}
                  </option>
                ))}
              </select>
            </div>

            <Button type="submit" variant="primary" size="md" className="shrink-0 sm:self-end sm:mb-1">
              Find Help Now →
            </Button>
          </form>

          {/* Secondary CTA */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <p className="text-gray-400 text-sm">Are you a tradesperson?</p>
            <Link href="/register-artisan">
              <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white hover:text-[#2E3192]">
                Register as an Artisan →
              </Button>
            </Link>
          </div>

          {content.mediaMode === "image" && content.mediaImageUrl ? (
            <div className="mt-8 rounded-2xl border border-white/20 bg-white/10 p-2 backdrop-blur">
              <Image
                src={content.mediaImageUrl}
                alt="Homepage hero visual"
                width={1200}
                height={500}
                className="w-full h-auto rounded-xl object-cover"
              />
            </div>
          ) : null}

          {hasSlides ? (
            <div className="mt-8 rounded-2xl border border-white/20 bg-white/10 p-2 backdrop-blur">
              <Image
                src={activeSlide}
                alt="Homepage hero slide"
                width={1200}
                height={500}
                className="w-full h-auto rounded-xl object-cover"
              />
              <div className="mt-3 flex items-center justify-center gap-2">
                {slides.map((slide, index) => (
                  <button
                    type="button"
                    key={`${slide}-${index}`}
                    onClick={() => setSlideIndex(index)}
                    className={`h-2.5 rounded-full transition-all ${index === slideIndex ? "w-8 bg-[#00AEEF]" : "w-2.5 bg-white/50"}`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Bottom transition */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0">
        <div className="h-20 bg-gradient-to-b from-transparent via-white/30 to-white/80" />
        <div className="absolute -bottom-16 left-1/2 h-32 w-[140%] -translate-x-1/2 rounded-[100%] bg-white" />
        <div className="absolute -bottom-10 left-1/2 h-16 w-[95%] -translate-x-1/2 rounded-[100%] bg-white/80 blur-2xl" />
      </div>
    </div>
  );
}
