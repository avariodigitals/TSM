import PageSection from "@/components/ui/PageSection";
import ContactForm from "@/components/forms/ContactForm";
import { getPageHeroContent } from "@/lib/page-content";

export default async function ContactPage() {
  const pageHero = await getPageHeroContent("contact");

  return (
    <>
      <div className="bg-gradient-to-br from-[#2E3192] to-[#1a1d6b] text-white py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-black mb-4">{pageHero.title}</h1>
          <p className="text-gray-300 text-lg">{pageHero.subtitle}</p>
        </div>
      </div>

      <PageSection background="white" className="py-16">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2 space-y-5">
            <div>
              <h2 className="text-xl font-black text-[#231F20] mb-4">Get In Touch</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                For general enquiries, media requests, partnerships or support — use the contact form or reach us directly via the details below.
              </p>
            </div>

            {[
              { icon: "📧", label: "Email", value: "enquiries@totalserve.co.uk" },
              { icon: "📞", label: "Phone", value: "0800 123 4567" },
              { icon: "📍", label: "Location", value: "United Kingdom" },
              { icon: "🕒", label: "Hours", value: "Mon–Fri: 8am–6pm\nSat: 9am–2pm" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3 p-4 bg-[#F5F7FA] rounded-xl">
                <span className="text-xl mt-0.5">{item.icon}</span>
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">{item.label}</div>
                  <div className="text-sm text-[#231F20] font-medium whitespace-pre-line">{item.value}</div>
                </div>
              </div>
            ))}

            <div className="p-4 bg-[#ED1C24]/5 border border-[#ED1C24]/20 rounded-xl">
              <p className="text-xs font-semibold text-[#ED1C24] mb-1">🚨 Emergency Enquiry?</p>
              <p className="text-xs text-gray-600">For urgent maintenance issues, please use our dedicated enquiry form and select &quot;Emergency&quot; urgency level.</p>
            </div>
          </div>

          <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <h2 className="text-xl font-black text-[#231F20] mb-6">Send Us a Message</h2>
            <ContactForm />
          </div>
        </div>
      </PageSection>
    </>
  );
}
