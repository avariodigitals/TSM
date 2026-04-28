import { Step } from "@/lib/types";

const customerSteps: Step[] = [
  {
    number: 1,
    title: "Search by Service & Location",
    description: "Select the service you need and your city or area across the UK.",
    icon: "🔍",
  },
  {
    number: 2,
    title: "Submit an Enquiry",
    description: "Fill in a short form with your job details, contact information and preferred timing.",
    icon: "📋",
  },
  {
    number: 3,
    title: "Total Serve Reviews",
    description: "Our team reviews your enquiry and identifies the best-matched artisan from our network.",
    icon: "✅",
  },
  {
    number: 4,
    title: "Get Connected",
    description: "We assign the right professional and facilitate the connection — no guesswork needed.",
    icon: "🤝",
  },
];

export default function HowItWorks() {
  return (
    <div className="py-16 lg:py-24">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 bg-[#00AEEF]/10 rounded-full px-4 py-2 mb-4">
          <span className="text-[#00AEEF] text-sm font-semibold">Simple Process</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-[#231F20] mb-4">
          How Total Serve Works
        </h2>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          No directory browsing. No cold calls. We handle the matching so you get the right person for the job.
        </p>
      </div>

      <div className="relative">
        {/* Connector line - desktop */}
        <div className="hidden lg:block absolute top-16 left-1/2 -translate-x-1/2 w-3/4 h-0.5 bg-gradient-to-r from-transparent via-[#00AEEF]/30 to-transparent" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {customerSteps.map((step) => (
            <div key={step.number} className="relative flex flex-col items-center text-center glass-card-soft rounded-2xl p-5 border border-white/60">
              {/* Step badge */}
              <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00AEEF] to-[#2E3192] flex items-center justify-center text-2xl shadow-lg mb-5">
                {step.icon}
              </div>

              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#231F20] border-2 border-white flex items-center justify-center z-20 hidden lg:flex">
                <span className="text-white text-[10px] font-black">{step.number}</span>
              </div>

              <h3 className="font-bold text-[#231F20] text-base mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
