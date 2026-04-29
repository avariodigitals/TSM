import { getSettingValue } from "@/lib/site-settings";

export type PageHeroContent = {
  title: string;
  subtitle: string;
};

export type HomeHeroContent = {
  badge: string;
  titlePrefix: string;
  titleHighlight: string;
  titleSuffix: string;
  subtitle: string;
  mediaMode?: "none" | "image" | "slides";
  mediaImageUrl?: string;
  mediaSlides?: string[];
};

export type HomeSectionsContent = {
  services: {
    badge: string;
    title: string;
    subtitle: string;
    buttonLabel: string;
  };
  cities: {
    badge: string;
    title: string;
    subtitle: string;
  };
  howItWorks: {
    badge: string;
    title: string;
    subtitle: string;
  };
  trust: {
    badge: string;
    title: string;
    subtitle: string;
  };
  emergencyCta: {
    heading: string;
    subtext: string;
  };
  enquiryCta: {
    heading: string;
    subtext: string;
  };
  artisanCta: {
    heading: string;
    subtext: string;
  };
  blog: {
    badge: string;
    title: string;
    subtitle: string;
    buttonLabel: string;
  };
  faq: {
    badge: string;
    title: string;
    subtitle: string;
    buttonLabel: string;
  };
};

const defaultPageHeroes: Record<string, PageHeroContent> = {
  about: {
    title: "About Total Serve",
    subtitle: "UK-wide maintenance support, delivered with care and professionalism.",
  },
  contact: {
    title: "Contact Us",
    subtitle: "Have a question or need help? Get in touch with the Total Serve team.",
  },
  howItWorks: {
    title: "How Total Serve Works",
    subtitle:
      "We make finding trusted tradespeople simple. No directory browsing, no cold calls — just submit an enquiry and we handle the rest.",
  },
  services: {
    title: "Our Services",
    subtitle: "Browse all the trades and maintenance services Total Serve covers across the United Kingdom.",
  },
  cities: {
    title: "Cities We Cover",
    subtitle: "Total Serve currently operates across these major UK cities. We are continually expanding our network.",
  },
  faq: {
    title: "Frequently Asked Questions",
    subtitle: "Everything you need to know about submitting enquiries, our process, and joining as an artisan.",
  },
  blog: {
    title: "Total Serve Blog",
    subtitle: "Practical maintenance advice, trade insights, and updates from the Total Serve team.",
  },
  enquiry: {
    title: "Submit an Enquiry",
    subtitle:
      "Fill in the form below. Total Serve will review your request and match you with the right vetted professional for your job.",
  },
  registerArtisan: {
    title: "Register as an Artisan",
    subtitle:
      "Join the Total Serve artisan network. Register your trade, get reviewed, and receive relevant job opportunities across the UK.",
  },
  search: {
    title: "Search Results",
    subtitle: "Find trusted professionals by service and city, then submit your enquiry in seconds.",
  },
  cityDetail: {
    title: "Tradespeople in {city}",
    subtitle: "Browse available services in your city and submit an enquiry for fast matching.",
  },
  serviceDetail: {
    title: "{service} Services",
    subtitle: "View common jobs we handle and discover cities where this service is available.",
  },
  serviceCity: {
    title: "{service} in {city}",
    subtitle: "Total Serve matches your request with vetted local professionals for this service.",
  },
};

const defaultHomeHero: HomeHeroContent = {
  badge: "UK-Wide Maintenance Support",
  titlePrefix: "Find Trusted",
  titleHighlight: "Tradespeople",
  titleSuffix: "Across the UK",
  subtitle:
    "Submit an enquiry for your service and location. Total Serve reviews your request and assigns the right vetted professional — so you don't have to search alone.",
  mediaMode: "none",
  mediaImageUrl: "",
  mediaSlides: [],
};

const defaultHomeSections: HomeSectionsContent = {
  services: {
    badge: "What We Cover",
    title: "Popular Services",
    subtitle: "From emergency repairs to planned maintenance, browse the trades we cover across the UK.",
    buttonLabel: "View All Services",
  },
  cities: {
    badge: "UK Coverage",
    title: "Browse by City",
    subtitle: "We currently serve these major UK cities with more being added regularly.",
  },
  howItWorks: {
    badge: "Simple Process",
    title: "How Total Serve Works",
    subtitle: "No directory browsing. No cold calls. We handle the matching so you get the right person for the job.",
  },
  trust: {
    badge: "Why Total Serve",
    title: "Why Choose Total Serve?",
    subtitle: "We're not a directory. We're a service - handling the hard work of finding the right tradesperson for you.",
  },
  emergencyCta: {
    heading: "Urgent Maintenance Issue?",
    subtext: "For emergency or time-sensitive requests, mark your enquiry as urgent and we'll prioritise it.",
  },
  enquiryCta: {
    heading: "Ready to Get Started?",
    subtext: "Submit an enquiry and let Total Serve find the right professional for you.",
  },
  artisanCta: {
    heading: "Join the Total Serve Network",
    subtext: "Register your trade and get access to relevant job opportunities across the UK.",
  },
  blog: {
    badge: "Latest Insights",
    title: "From the Total Serve Blog",
    subtitle: "Maintenance guidance, practical trade advice, and updates from our team.",
    buttonLabel: "View All Articles",
  },
  faq: {
    badge: "Common Questions",
    title: "Frequently Asked Questions",
    subtitle: "Everything you need to know about how Total Serve works.",
    buttonLabel: "View All FAQs",
  },
};

export async function getPageHeroesContent() {
  const stored = await getSettingValue<Record<string, PageHeroContent>>("content.pageHeroes", defaultPageHeroes);
  return {
    ...defaultPageHeroes,
    ...stored,
  };
}

export async function getHomeHeroContent() {
  return getSettingValue<HomeHeroContent>("content.homeHero", defaultHomeHero);
}

export async function getHomeSectionsContent() {
  const stored = await getSettingValue<HomeSectionsContent>("content.homeSections", defaultHomeSections);
  return {
    ...defaultHomeSections,
    ...stored,
    services: { ...defaultHomeSections.services, ...(stored.services ?? {}) },
    cities: { ...defaultHomeSections.cities, ...(stored.cities ?? {}) },
    howItWorks: { ...defaultHomeSections.howItWorks, ...(stored.howItWorks ?? {}) },
    trust: { ...defaultHomeSections.trust, ...(stored.trust ?? {}) },
    emergencyCta: { ...defaultHomeSections.emergencyCta, ...(stored.emergencyCta ?? {}) },
    enquiryCta: { ...defaultHomeSections.enquiryCta, ...(stored.enquiryCta ?? {}) },
    artisanCta: { ...defaultHomeSections.artisanCta, ...(stored.artisanCta ?? {}) },
    blog: { ...defaultHomeSections.blog, ...(stored.blog ?? {}) },
    faq: { ...defaultHomeSections.faq, ...(stored.faq ?? {}) },
  };
}

export async function getPageHeroContent(pageKey: keyof typeof defaultPageHeroes) {
  const pageHeroes = await getPageHeroesContent();
  return pageHeroes[pageKey] ?? defaultPageHeroes[pageKey];
}
