import Link from "next/link";
import Button from "@/components/ui/Button";

interface CTASectionProps {
  variant?: "enquiry" | "artisan" | "emergency";
  heading?: string;
  subtext?: string;
}

const defaults = {
  enquiry: {
    heading: "Ready to Get Started?",
    subtext: "Submit an enquiry and let Total Serve find the right professional for you.",
    buttonText: "Submit Your Enquiry",
    buttonHref: "/enquiry",
    buttonVariant: "red" as const,
    bg: "from-[#2E3192] to-[#1a1d6b]",
  },
  artisan: {
    heading: "Join the Total Serve Network",
    subtext: "Register your trade and get access to relevant job opportunities across the UK.",
    buttonText: "Register as an Artisan",
    buttonHref: "/register-artisan",
    buttonVariant: "red" as const,
    bg: "from-[#231F20] to-[#2E3192]",
  },
  emergency: {
    heading: "Urgent Maintenance Issue?",
    subtext: "For emergency or time-sensitive requests, mark your enquiry as urgent and we'll prioritise it.",
    buttonText: "Submit Urgent Enquiry",
    buttonHref: "/enquiry?urgency=emergency",
    buttonVariant: "red" as const,
    bg: "from-[#ED1C24]/90 to-[#2E3192]",
  },
};

export default function CTASection({ variant = "enquiry", heading, subtext }: CTASectionProps) {
  const config = defaults[variant];
  const displayHeading = heading || config.heading;
  const displaySubtext = subtext || config.subtext;

  return (
    <div className={`relative bg-gradient-to-br ${config.bg} rounded-3xl overflow-hidden`}>
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_30%_50%,_#00AEEF,_transparent_60%)]" />
      <div className="relative px-8 py-14 sm:px-12 lg:px-16 text-center">
        <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">{displayHeading}</h2>
        <p className="text-gray-300 text-lg max-w-xl mx-auto mb-8">{displaySubtext}</p>
        <Link href={config.buttonHref}>
          <Button variant={config.buttonVariant} size="lg">
            {config.buttonText}
          </Button>
        </Link>
      </div>
    </div>
  );
}
