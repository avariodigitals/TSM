"use client";

import { useState } from "react";
import type { Service, City } from "@/lib/types";
import Button from "@/components/ui/Button";

interface EnquiryFormProps {
  prefilledService?: string;
  prefilledCity?: string;
  prefilledUrgency?: string;
  services: Service[];
  cities: City[];
}

export default function EnquiryForm({
  prefilledService = "",
  prefilledCity = "",
  prefilledUrgency = "",
  services,
  cities,
}: EnquiryFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    serviceNeeded: prefilledService,
    city: prefilledCity,
    postcode: "",
    jobDescription: "",
    urgencyLevel: prefilledUrgency || "standard",
    preferredContact: "email",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);
    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        setErrorMessage("We could not submit your enquiry right now. Please try again.");
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
          ✅
        </div>
        <h3 className="text-2xl font-black text-[#231F20] mb-3">Enquiry Received!</h3>
        <p className="text-gray-500 leading-relaxed max-w-md mx-auto">
          Your enquiry has been received. Total Serve will review your request and contact you shortly with details of the professional we&apos;ve matched to your job.
        </p>
        <p className="text-sm text-gray-400 mt-4">
          Typical response time: 2–4 hours during business hours.
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
            placeholder="e.g. Sarah Johnson"
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
            Postcode <span className="text-[#ED1C24]">*</span>
          </label>
          <input
            type="text"
            name="postcode"
            required
            value={form.postcode}
            onChange={handleChange}
            placeholder="e.g. SW1A 1AA"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent text-sm transition"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#231F20] mb-1.5">
            Service Needed <span className="text-[#ED1C24]">*</span>
          </label>
          <select
            name="serviceNeeded"
            required
            value={form.serviceNeeded}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent text-sm transition bg-white"
          >
            <option value="">Select a service...</option>
            {services.map((s) => (
              <option key={s.id} value={s.slug}>
                {s.icon} {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#231F20] mb-1.5">
            City / Location <span className="text-[#ED1C24]">*</span>
          </label>
          <select
            name="city"
            required
            value={form.city}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent text-sm transition bg-white"
          >
            <option value="">Select a city...</option>
            {cities.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#231F20] mb-1.5">
          Job Description <span className="text-[#ED1C24]">*</span>
        </label>
        <textarea
          name="jobDescription"
          required
          value={form.jobDescription}
          onChange={handleChange}
          rows={4}
          placeholder="Please describe the work needed in as much detail as possible..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent text-sm transition resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-[#231F20] mb-1.5">
            Urgency Level
          </label>
          <select
            name="urgencyLevel"
            value={form.urgencyLevel}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent text-sm transition bg-white"
          >
            <option value="standard">Standard — Within a few days</option>
            <option value="urgent">Urgent — Within 24–48 hours</option>
            <option value="emergency">Emergency — As soon as possible</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#231F20] mb-1.5">
            Preferred Contact Method
          </label>
          <select
            name="preferredContact"
            value={form.preferredContact}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent text-sm transition bg-white"
          >
            <option value="email">Email</option>
            <option value="phone">Phone Call</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </div>
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
          disabled={loading}
          className="text-base"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Submitting your enquiry...
            </span>
          ) : (
            "Submit Enquiry →"
          )}
        </Button>
        <p className="text-xs text-gray-400 text-center mt-3">
          By submitting, you agree to be contacted by Total Serve regarding your enquiry. We will not share your details with third parties without consent.
        </p>
      </div>
    </form>
  );
}
