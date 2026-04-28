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

export async function getPageHeroesContent() {
  return getSettingValue<Record<string, PageHeroContent>>("content.pageHeroes", defaultPageHeroes);
}

export async function getHomeHeroContent() {
  return getSettingValue<HomeHeroContent>("content.homeHero", defaultHomeHero);
}

export async function getPageHeroContent(pageKey: keyof typeof defaultPageHeroes) {
  const pageHeroes = await getPageHeroesContent();
  return pageHeroes[pageKey] ?? defaultPageHeroes[pageKey];
}
