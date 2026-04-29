import PageSection from "@/components/ui/PageSection";
import ContactForm from "@/components/forms/ContactForm";
import { getPageHeroContent } from "@/lib/page-content";
import { getSettingValue } from "@/lib/site-settings";

type ContactPageContent = {
  introTitle: string;
  introBody: string;
  details: Array<{ icon: string; label: string; value: string }>;
  emergencyTitle: string;
  emergencyBody: string;
  formTitle: string;
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

const defaultContactContent: ContactPageContent = {
  introTitle: "Get In Touch",
  introBody:
    "For general enquiries, media requests, partnerships or support — use the contact form or reach us directly via the details below.",
  details: [
    { icon: "📧", label: "Email", value: "enquiries@totalserve.co.uk" },
    { icon: "📞", label: "Phone", value: "0800 123 4567" },
    { icon: "📍", label: "Location", value: "United Kingdom" },
    { icon: "🕒", label: "Hours", value: "Mon–Fri: 8am–6pm\nSat: 9am–2pm" },
  ],
  emergencyTitle: "🚨 Emergency Enquiry?",
  emergencyBody:
    "For urgent maintenance issues, please use our dedicated enquiry form and select \"Emergency\" urgency level.",
  formTitle: "Send Us a Message",
  formNameLabel: "Full Name",
  formEmailLabel: "Email Address",
  formSubjectLabel: "Subject",
  formMessageLabel: "Message",
  formNamePlaceholder: "Your name",
  formEmailPlaceholder: "you@example.com",
  formSubjectPlaceholder: "How can we help?",
  formMessagePlaceholder: "Your message...",
  submitButtonLabel: "Send Message →",
  submittingButtonLabel: "Sending...",
  successTitle: "Message Sent",
  successBody: "Thank you for getting in touch. We will respond within 1–2 business days.",
};

export default async function ContactPage() {
  const pageHero = await getPageHeroContent("contact");
  const content = await getSettingValue<ContactPageContent>("page.contact", defaultContactContent);

  const details =
    Array.isArray(content.details) && content.details.length > 0
      ? content.details
      : defaultContactContent.details;

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
              <h2 className="text-xl font-black text-[#231F20] mb-4">{content.introTitle}</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                {content.introBody}
              </p>
            </div>

            {details.map((item) => (
              <div key={item.label} className="flex items-start gap-3 p-4 bg-[#F5F7FA] rounded-xl">
                <span className="text-xl mt-0.5">{item.icon}</span>
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">{item.label}</div>
                  <div className="text-sm text-[#231F20] font-medium whitespace-pre-line">{item.value}</div>
                </div>
              </div>
            ))}

            <div className="p-4 bg-[#ED1C24]/5 border border-[#ED1C24]/20 rounded-xl">
              <p className="text-xs font-semibold text-[#ED1C24] mb-1">{content.emergencyTitle}</p>
              <p className="text-xs text-gray-600">{content.emergencyBody}</p>
            </div>
          </div>

          <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <h2 className="text-xl font-black text-[#231F20] mb-6">{content.formTitle}</h2>
            <ContactForm content={content} />
          </div>
        </div>
      </PageSection>
    </>
  );
}
