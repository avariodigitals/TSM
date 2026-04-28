"use client";

import { useState } from "react";
import type { Service, City } from "@/lib/types";
import Button from "@/components/ui/Button";

export default function ArtisanRegistrationForm({ services, cities }: { services: Service[]; cities: City[] }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    businessName: "",
    email: "",
    phone: "",
    tradeCategory: "",
    citiesCovered: [] as string[],
    yearsExperience: "",
    certifications: "",
    profileDescription: "",
    consentGiven: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCityToggle = (citySlug: string) => {
    setForm((prev) => ({
      ...prev,
      citiesCovered: prev.citiesCovered.includes(citySlug)
        ? prev.citiesCovered.filter((c) => c !== citySlug)
        : [...prev.citiesCovered, citySlug],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);
    try {
      const response = await fetch("/api/artisan-registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        setErrorMessage("We could not submit your registration right now. Please try again.");
        setLoading(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setErrorMessage("Connection issue detected. Please check your internet and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl border border-green-200 shadow-sm p-10 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl mx-auto mb-5">
          🎉
        </div>
        <h3 className="text-2xl font-black text-[#231F20] mb-3">Registration Received!</h3>
        <p className="text-gray-500 leading-relaxed max-w-md mx-auto">
          Your registration has been received. Our team will review your details before adding you to the Total Serve artisan network. We&apos;ll be in touch soon.
        </p>
        <p className="text-sm text-gray-400 mt-4">
          Review typically takes 2–5 business days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-[#231F20] mb-1.5">
            Full Name <span className="text-[#ED1C24]">*</span>
          </label>
          <input
            type="text"
            name="fullName"
            required
            value={form.fullName}
            onChange={handleChange}
            placeholder="Your full name"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent text-sm transition"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#231F20] mb-1.5">
            Business Name
          </label>
          <input
            type="text"
            name="businessName"
            value={form.businessName}
            onChange={handleChange}
            placeholder="Your trading name or Ltd company"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent text-sm transition"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#231F20] mb-1.5">
            Email Address <span className="text-[#ED1C24]">*</span>
          </label>
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent text-sm transition"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#231F20] mb-1.5">
            Phone Number <span className="text-[#ED1C24]">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            required
            value={form.phone}
            onChange={handleChange}
            placeholder="07700 900 000"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent text-sm transition"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#231F20] mb-1.5">
            Trade / Service Category <span className="text-[#ED1C24]">*</span>
          </label>
          <select
            name="tradeCategory"
            required
            value={form.tradeCategory}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent text-sm transition bg-white"
          >
            <option value="">Select your trade...</option>
            {services.map((s) => (
              <option key={s.id} value={s.slug}>
                {s.icon} {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#231F20] mb-1.5">
            Years of Experience <span className="text-[#ED1C24]">*</span>
          </label>
          <select
            name="yearsExperience"
            required
            value={form.yearsExperience}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent text-sm transition bg-white"
          >
            <option value="">Select experience level...</option>
            <option value="1-2">1–2 years</option>
            <option value="3-5">3–5 years</option>
            <option value="5-10">5–10 years</option>
            <option value="10+">10+ years</option>
          </select>
        </div>
      </div>

      {/* Cities covered */}
      <div>
        <label className="block text-sm font-semibold text-[#231F20] mb-2">
          Cities / Areas Covered <span className="text-[#ED1C24]">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {cities.map((city) => (
            <button
              key={city.id}
              type="button"
              onClick={() => handleCityToggle(city.slug)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                form.citiesCovered.includes(city.slug)
                  ? "bg-[#00AEEF] border-[#00AEEF] text-white"
                  : "bg-white border-gray-200 text-gray-600 hover:border-[#00AEEF] hover:text-[#00AEEF]"
              }`}
            >
              {city.name}
            </button>
          ))}
        </div>
        {form.citiesCovered.length === 0 && (
          <p className="text-xs text-gray-400 mt-1.5">Select at least one city.</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#231F20] mb-1.5">
          Certifications & Qualifications
        </label>
        <input
          type="text"
          name="certifications"
          value={form.certifications}
          onChange={handleChange}
          placeholder="e.g. Gas Safe Registered, NICEIC, City & Guilds, NVQ Level 3..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent text-sm transition"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#231F20] mb-1.5">
          Short Profile / Description <span className="text-[#ED1C24]">*</span>
        </label>
        <textarea
          name="profileDescription"
          required
          value={form.profileDescription}
          onChange={handleChange}
          rows={4}
          placeholder="Tell us about your experience, specialities, and why you'd be a great addition to the Total Serve network..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent text-sm transition resize-none"
        />
      </div>

      <div className="flex items-start gap-3 p-4 rounded-xl bg-[#F5F7FA] border border-gray-200">
        <input
          type="checkbox"
          name="consentGiven"
          id="consentGiven"
          required
          checked={form.consentGiven}
          onChange={handleChange}
          className="mt-0.5 w-4 h-4 text-[#00AEEF] rounded border-gray-300 focus:ring-[#00AEEF]"
        />
        <label htmlFor="consentGiven" className="text-sm text-gray-600 leading-relaxed">
          I confirm that the information I have provided is accurate and truthful. I agree to Total Serve contacting me to discuss my application and, if approved, to pass my contact details to relevant clients. I understand my details will be held securely in accordance with UK GDPR.
        </label>
      </div>

      <div className="pt-2">
        {errorMessage ? (
          <p className="text-sm text-[#ED1C24] text-center mb-3">{errorMessage}</p>
        ) : null}
        <Button
          type="submit"
          variant="red"
          size="lg"
          fullWidth
          disabled={loading || form.citiesCovered.length === 0}
          className="text-base"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Submitting registration...
            </span>
          ) : (
            "Submit Registration →"
          )}
        </Button>
      </div>
    </form>
  );
}
