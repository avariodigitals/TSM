"use client";

import { useState } from "react";
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
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
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
      <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
        {loading ? content.submittingButtonLabel : content.submitButtonLabel}
      </Button>
    </form>
  );
}
