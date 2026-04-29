import { trustStats } from "@/lib/data";

const whyChooseItems = [
  {
    icon: "🔐",
    title: "Vetted & Verified",
    description: "Every artisan in our network is checked for qualifications, insurance and references before joining.",
  },
  {
    icon: "🎯",
    title: "Right Match Every Time",
    description: "We don't just send anyone — our team manually reviews your enquiry and matches you with the best-suited professional.",
  },
  {
    icon: "⚡",
    title: "Fast Response",
    description: "We aim to respond to all enquiries within 2–4 hours during business hours. Urgent requests are prioritised.",
  },
  {
    icon: "🇬🇧",
    title: "UK-Wide Coverage",
    description: "From London to Glasgow, our growing network covers major cities and regions across the United Kingdom.",
  },
  {
    icon: "🛡️",
    title: "No Direct Booking Risk",
    description: "Unlike marketplaces, we act as your intermediary — ensuring quality checks are done before any connection is made.",
  },
  {
    icon: "💬",
    title: "Clear Communication",
    description: "You're kept informed at every step. No surprises, no hidden charges for our matching service.",
  },
];

type TrustSectionContent = {
  badge: string;
  title: string;
  subtitle: string;
};

export default function TrustSection({ content }: { content?: TrustSectionContent }) {
  const heading = {
    badge: content?.badge ?? "Why Total Serve",
    title: content?.title ?? "Why Choose Total Serve?",
    subtitle:
      content?.subtitle ??
      "We're not a directory. We're a service - handling the hard work of finding the right tradesperson for you.",
  };

  return (
    <div className="py-16 lg:py-24">
      {/* Stats bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
        {trustStats.map((stat) => (
          <div
            key={stat.label}
            className="glass-card-soft rounded-2xl p-6 text-center border border-[#00AEEF]/20"
          >
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-3xl font-black text-[#2E3192] mb-1">{stat.value}</div>
            <div className="text-gray-500 text-sm font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Why choose */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-[#00AEEF]/10 rounded-full px-4 py-2 mb-4">
          <span className="text-[#00AEEF] text-sm font-semibold">{heading.badge}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-[#231F20] mb-4">
          {heading.title}
        </h2>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          {heading.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {whyChooseItems.map((item) => (
          <div
            key={item.title}
            className="glass-card-soft rounded-2xl p-6 hover:-translate-y-0.5 hover:shadow-[0_18px_28px_-20px_rgba(0,44,90,0.45)] hover:border-[#00AEEF]/28 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-[#F5F7FA] flex items-center justify-center text-2xl mb-4">
              {item.icon}
            </div>
            <h3 className="font-bold text-[#231F20] text-base mb-2">{item.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
