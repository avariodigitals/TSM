"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Button from "@/components/ui/Button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/blog", label: "Blog" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/register-artisan", label: "Register as Artisan" },
  { href: "/contact", label: "Contact" },
];

export default function Header({
  logoUrl,
  ctaLabel,
  ctaHref,
}: {
  logoUrl: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <Image
              src={logoUrl || "/tml-logo.webp"}
              alt="Total Serve Maintenance Ltd"
              width={168}
              height={48}
              priority
              className="h-10 w-auto sm:h-11"
            />
            <div className="hidden sm:block">
              <div className="font-black text-[#2E3192] text-lg leading-none tracking-tight">
                Total Serve
              </div>
              <div className="text-[10px] text-[#00AEEF] font-semibold uppercase tracking-widest leading-none">
                Maintenance Ltd
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-lg text-sm font-medium text-[#231F20] hover:text-[#00AEEF] hover:bg-[#F5F7FA] transition-colors duration-150"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href={ctaHref || "/enquiry"}>
              <Button variant="red" size="sm">
                {ctaLabel || "Submit Enquiry"}
              </Button>
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="lg:hidden inline-flex items-center justify-center min-h-11 min-w-11 p-2 rounded-lg text-[#231F20] hover:bg-gray-100 transition"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="lg:hidden pb-4 border-t border-gray-100 mt-0">
            <nav className="flex flex-col gap-1 pt-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3.5 rounded-lg text-base font-medium text-[#231F20] hover:text-[#00AEEF] hover:bg-[#F5F7FA] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 px-4">
                <Link href={ctaHref || "/enquiry"} onClick={() => setMobileOpen(false)}>
                  <Button variant="red" size="sm" fullWidth>
                    {ctaLabel || "Submit Enquiry"}
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
