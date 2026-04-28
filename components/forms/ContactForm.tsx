"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

export default function ContactForm() {
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
        <h3 className="text-xl font-black text-[#231F20] mb-2">Message Sent</h3>
        <p className="text-gray-500 text-sm">Thank you for getting in touch. We will respond within 1–2 business days.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[#231F20] mb-1.5">Full Name <span className="text-[#ED1C24]">*</span></label>
          <input type="text" name="name" required value={form.name} onChange={handleChange} placeholder="Your name" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] text-sm transition" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#231F20] mb-1.5">Email Address <span className="text-[#ED1C24]">*</span></label>
          <input type="email" name="email" required value={form.email} onChange={handleChange} placeholder="you@example.com" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] text-sm transition" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-[#231F20] mb-1.5">Subject <span className="text-[#ED1C24]">*</span></label>
        <input type="text" name="subject" required value={form.subject} onChange={handleChange} placeholder="How can we help?" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] text-sm transition" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-[#231F20] mb-1.5">Message <span className="text-[#ED1C24]">*</span></label>
        <textarea name="message" required value={form.message} onChange={handleChange} rows={5} placeholder="Your message..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] text-sm transition resize-none" />
      </div>
      <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
        {loading ? "Sending..." : "Send Message →"}
      </Button>
    </form>
  );
}
