"use client";

import { useState } from "react";
import Script from "next/script";
import Button from "@/components/ui/Button";

type ContactFormContent = {
  formNameLabel: string;
  formEmailLabel: string;
  formSubjectLabel: string;
  formMessageLabel: string;
  formNamePlaceholder: string;
  formEmailPlaceholder: string;
  formSubjectPlaceholder: string;
  formMessagePlaceholder: string;
  submitButtonLabel: string;
  submittingButtonLabel: string;
  successTitle: string;
  successBody: string;
};

export default function ContactForm({ content }: { content: ContactFormContent }) {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    website: "",
    startedAt: Date.now(),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    const captchaToken = turnstileSiteKey
      ? e.currentTarget.querySelector<HTMLInputElement>('input[name="cf-turnstile-response"]')?.value ?? ""
      : "";

    if (turnstileSiteKey && !captchaToken) {
      setErrorMessage("Please complete the captcha to continue.");
      setLoading(false);
      return;
    }

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, captchaToken }),
    });

    setLoading(false);

    if (!response.ok) {
      try {
        const payload = (await response.json()) as { message?: string };
        setErrorMessage(payload.message || "Unable to send your message at this time.");
      } catch {
        setErrorMessage("Unable to send your message at this time.");
      }
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center py-10">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-2xl mx-auto mb-4">✅</div>
        <h3 className="text-xl font-black text-[#231F20] mb-2">{content.successTitle}</h3>
        <p className="text-gray-500 text-sm">{content.successBody}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {turnstileSiteKey ? (
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
      ) : null}

      {errorMessage ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {errorMessage}
        </div>
      ) : null}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[#231F20] mb-1.5">{content.formNameLabel} <span className="text-[#ED1C24]">*</span></label>
          <input type="text" name="name" required value={form.name} onChange={handleChange} placeholder={content.formNamePlaceholder} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] text-sm transition" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#231F20] mb-1.5">{content.formEmailLabel} <span className="text-[#ED1C24]">*</span></label>
          <input type="email" name="email" required value={form.email} onChange={handleChange} placeholder={content.formEmailPlaceholder} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] text-sm transition" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-[#231F20] mb-1.5">{content.formSubjectLabel} <span className="text-[#ED1C24]">*</span></label>
        <input type="text" name="subject" required value={form.subject} onChange={handleChange} placeholder={content.formSubjectPlaceholder} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] text-sm transition" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-[#231F20] mb-1.5">{content.formMessageLabel} <span className="text-[#ED1C24]">*</span></label>
        <textarea name="message" required value={form.message} onChange={handleChange} rows={5} placeholder={content.formMessagePlaceholder} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] text-sm transition resize-none" />
      </div>

      <div className="hidden" aria-hidden="true">
        <label htmlFor="contact-website">Company website</label>
        <input
          id="contact-website"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={handleChange}
        />
      </div>

      {turnstileSiteKey ? (
        <div className="flex justify-center">
          <div className="cf-turnstile" data-sitekey={turnstileSiteKey} data-theme="light" />
        </div>
      ) : null}

      <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
        {loading ? content.submittingButtonLabel : content.submitButtonLabel}
      </Button>
    </form>
  );
}
