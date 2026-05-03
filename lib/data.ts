import { Service, City, ServiceCityMapping, FAQItem, TrustStat } from "./types";

export const services: Service[] = [
  {
    id: "1",
    name: "Electrician",
    slug: "electrician",
    icon: "⚡",
    description:
      "Our network of certified electricians handles everything from minor repairs to full rewires. All our electricians are NICEIC or NAPIT registered, ensuring all work meets UK electrical standards and building regulations.",
    shortDescription: "Certified electricians for domestic and commercial electrical work.",
    commonIssues: [
      "Fuse box / consumer unit upgrades",
      "New sockets, switches and lighting",
      "Electric vehicle (EV) charger installation",
      "Fault finding and testing",
      "Full or partial rewire",
      "Safety inspection and EICR certificates",
    ],
    color: "#00AEEF",
  },
  {
    id: "2",
    name: "Plumber",
    slug: "plumber",
    icon: "🔧",
    description:
      "From leaking taps to full bathroom installations, our trusted plumbers are experienced across all domestic and commercial plumbing requirements. Fast response times available for urgent issues.",
    shortDescription: "Trusted plumbers for repairs, installations and emergency callouts.",
    commonIssues: [
      "Leaking taps and pipes",
      "Burst pipes and emergency repairs",
      "Boiler and heating system issues",
      "Bathroom and kitchen installations",
      "Blocked drains and toilets",
      "Water pressure problems",
    ],
    color: "#2E3192",
  },
  {
    id: "3",
    name: "Gas Engineer",
    slug: "gas-engineer",
    icon: "🔥",
    description:
      "All gas work must be carried out by a Gas Safe registered engineer. Our network of Gas Safe professionals handle boiler servicing, repairs, installations and safety checks across the UK.",
    shortDescription: "Gas Safe registered engineers for boilers, heating and gas appliances.",
    commonIssues: [
      "Boiler service and annual checks",
      "Boiler repair and replacement",
      "Gas appliance installation",
      "Gas safety certificates (CP12)",
      "Central heating system faults",
      "Gas leak investigation",
    ],
    color: "#ED1C24",
  },
  {
    id: "4",
    name: "Carpenter",
    slug: "carpenter",
    icon: "🪚",
    description:
      "Skilled carpenters and joiners for all woodwork needs — from bespoke fitted furniture to structural repairs. Our artisans bring craftsmanship and attention to detail to every project.",
    shortDescription: "Skilled carpenters for joinery, fitted furniture and woodwork.",
    commonIssues: [
      "Door hanging and alignment",
      "Fitted wardrobes and shelving",
      "Skirting boards and architraves",
      "Decking and outdoor structures",
      "Staircase repairs",
      "Window frame repairs",
    ],
    color: "#00AEEF",
  },
  {
    id: "5",
    name: "Painter & Decorator",
    slug: "painter-decorator",
    icon: "🎨",
    description:
      "Professional painters and decorators to refresh your home or commercial space. Our artisans use premium materials and meticulous preparation to deliver a flawless finish.",
    shortDescription: "Professional painters and decorators for interior and exterior projects.",
    commonIssues: [
      "Interior and exterior painting",
      "Wallpaper hanging and removal",
      "Feature walls and specialist finishes",
      "Commercial painting projects",
      "Crack filling and surface prep",
      "Woodwork staining and varnishing",
    ],
    color: "#2E3192",
  },
  {
    id: "6",
    name: "Cleaner",
    slug: "cleaner",
    icon: "✨",
    description:
      "Reliable cleaning professionals for domestic and commercial properties. From regular housekeeping to deep cleans and end-of-tenancy cleans, Totalserve connects you with vetted cleaners.",
    shortDescription: "Vetted cleaners for domestic, commercial and end-of-tenancy cleans.",
    commonIssues: [
      "Regular domestic cleaning",
      "Deep cleaning and spring cleans",
      "End-of-tenancy cleaning",
      "Commercial office cleaning",
      "Post-construction cleaning",
      "Carpet and upholstery cleaning",
    ],
    color: "#00AEEF",
  },
  {
    id: "7",
    name: "Roofer",
    slug: "roofer",
    icon: "🏠",
    description:
      "Experienced roofing contractors for repairs, replacements and new installations. Our roofers handle all roof types including tiles, slates, flat roofs and guttering across residential and commercial properties.",
    shortDescription: "Experienced roofers for repairs, replacements and gutter work.",
    commonIssues: [
      "Roof tile and slate repairs",
      "Flat roof repairs and replacements",
      "Gutter cleaning and repairs",
      "Chimney repairs and repointing",
      "Roof inspections and surveys",
      "Moss treatment and removal",
    ],
    color: "#ED1C24",
  },
  {
    id: "8",
    name: "General Maintenance",
    slug: "general-maintenance",
    icon: "🛠️",
    description:
      "For those everyday jobs that need a reliable pair of hands, our general maintenance artisans cover a wide range of tasks. Ideal for landlords, letting agents and homeowners.",
    shortDescription: "Reliable handypeople for everyday property maintenance and repairs.",
    commonIssues: [
      "Furniture assembly",
      "TV wall mounting",
      "Tiling repairs",
      "Door and window adjustments",
      "Minor plastering and patching",
      "Flat-pack assembly",
    ],
    color: "#2E3192",
  },
];

export const cities: City[] = [
  {
    id: "1",
    name: "London",
    slug: "london",
    region: "Greater London",
    description: "Covering all London boroughs from Central to Outer London.",
  },
  {
    id: "2",
    name: "Manchester",
    slug: "manchester",
    region: "Greater Manchester",
    description: "Serving Manchester city centre and surrounding areas.",
  },
  {
    id: "3",
    name: "Birmingham",
    slug: "birmingham",
    region: "West Midlands",
    description: "Covering Birmingham and the wider West Midlands area.",
  },
  {
    id: "4",
    name: "Leeds",
    slug: "leeds",
    region: "West Yorkshire",
    description: "Serving Leeds city centre and West Yorkshire.",
  },
  {
    id: "5",
    name: "Liverpool",
    slug: "liverpool",
    region: "Merseyside",
    description: "Covering Liverpool and the Merseyside region.",
  },
  {
    id: "6",
    name: "Glasgow",
    slug: "glasgow",
    region: "Scotland",
    description: "Serving Glasgow and the surrounding Scottish Central Belt.",
  },
  {
    id: "7",
    name: "Bristol",
    slug: "bristol",
    region: "South West England",
    description: "Covering Bristol and surrounding South West areas.",
  },
  {
    id: "8",
    name: "Sheffield",
    slug: "sheffield",
    region: "South Yorkshire",
    description: "Serving Sheffield and South Yorkshire.",
  },
  {
    id: "9",
    name: "Edinburgh",
    slug: "edinburgh",
    region: "Scotland",
    description: "Covering Edinburgh and surrounding Lothian area.",
  },
  {
    id: "10",
    name: "Leicester",
    slug: "leicester",
    region: "East Midlands",
    description: "Serving Leicester and Leicestershire.",
  },
  {
    id: "11",
    name: "Coventry",
    slug: "coventry",
    region: "West Midlands",
    description: "Covering Coventry and nearby areas.",
  },
  {
    id: "12",
    name: "Nottingham",
    slug: "nottingham",
    region: "East Midlands",
    description: "Serving Nottingham and the East Midlands.",
  },
];

export const serviceCityMappings: ServiceCityMapping[] = [
  // London - all services
  { serviceSlug: "electrician", citySlug: "london", featured: true },
  { serviceSlug: "plumber", citySlug: "london", featured: true },
  { serviceSlug: "gas-engineer", citySlug: "london", featured: true },
  { serviceSlug: "carpenter", citySlug: "london" },
  { serviceSlug: "painter-decorator", citySlug: "london" },
  { serviceSlug: "cleaner", citySlug: "london", featured: true },
  { serviceSlug: "roofer", citySlug: "london" },
  { serviceSlug: "general-maintenance", citySlug: "london" },

  // Manchester
  { serviceSlug: "electrician", citySlug: "manchester", featured: true },
  { serviceSlug: "plumber", citySlug: "manchester", featured: true },
  { serviceSlug: "gas-engineer", citySlug: "manchester" },
  { serviceSlug: "carpenter", citySlug: "manchester" },
  { serviceSlug: "painter-decorator", citySlug: "manchester" },
  { serviceSlug: "cleaner", citySlug: "manchester" },
  { serviceSlug: "roofer", citySlug: "manchester" },
  { serviceSlug: "general-maintenance", citySlug: "manchester" },

  // Birmingham
  { serviceSlug: "electrician", citySlug: "birmingham", featured: true },
  { serviceSlug: "plumber", citySlug: "birmingham", featured: true },
  { serviceSlug: "gas-engineer", citySlug: "birmingham" },
  { serviceSlug: "carpenter", citySlug: "birmingham" },
  { serviceSlug: "painter-decorator", citySlug: "birmingham" },
  { serviceSlug: "cleaner", citySlug: "birmingham" },
  { serviceSlug: "roofer", citySlug: "birmingham" },
  { serviceSlug: "general-maintenance", citySlug: "birmingham" },

  // Leeds
  { serviceSlug: "electrician", citySlug: "leeds" },
  { serviceSlug: "plumber", citySlug: "leeds" },
  { serviceSlug: "gas-engineer", citySlug: "leeds" },
  { serviceSlug: "cleaner", citySlug: "leeds" },
  { serviceSlug: "general-maintenance", citySlug: "leeds" },

  // Liverpool
  { serviceSlug: "electrician", citySlug: "liverpool" },
  { serviceSlug: "plumber", citySlug: "liverpool" },
  { serviceSlug: "gas-engineer", citySlug: "liverpool" },
  { serviceSlug: "roofer", citySlug: "liverpool" },
  { serviceSlug: "general-maintenance", citySlug: "liverpool" },

  // Glasgow
  { serviceSlug: "electrician", citySlug: "glasgow" },
  { serviceSlug: "plumber", citySlug: "glasgow" },
  { serviceSlug: "gas-engineer", citySlug: "glasgow" },
  { serviceSlug: "cleaner", citySlug: "glasgow" },

  // Bristol
  { serviceSlug: "electrician", citySlug: "bristol" },
  { serviceSlug: "plumber", citySlug: "bristol" },
  { serviceSlug: "gas-engineer", citySlug: "bristol" },
  { serviceSlug: "carpenter", citySlug: "bristol" },
  { serviceSlug: "painter-decorator", citySlug: "bristol" },

  // Sheffield
  { serviceSlug: "electrician", citySlug: "sheffield" },
  { serviceSlug: "plumber", citySlug: "sheffield" },
  { serviceSlug: "roofer", citySlug: "sheffield" },
  { serviceSlug: "general-maintenance", citySlug: "sheffield" },

  // Edinburgh
  { serviceSlug: "electrician", citySlug: "edinburgh" },
  { serviceSlug: "plumber", citySlug: "edinburgh" },
  { serviceSlug: "gas-engineer", citySlug: "edinburgh" },
  { serviceSlug: "cleaner", citySlug: "edinburgh" },

  // Leicester
  { serviceSlug: "electrician", citySlug: "leicester" },
  { serviceSlug: "plumber", citySlug: "leicester" },
  { serviceSlug: "general-maintenance", citySlug: "leicester" },

  // Coventry
  { serviceSlug: "electrician", citySlug: "coventry" },
  { serviceSlug: "plumber", citySlug: "coventry" },
  { serviceSlug: "painter-decorator", citySlug: "coventry" },

  // Nottingham
  { serviceSlug: "electrician", citySlug: "nottingham" },
  { serviceSlug: "plumber", citySlug: "nottingham" },
  { serviceSlug: "gas-engineer", citySlug: "nottingham" },
  { serviceSlug: "cleaner", citySlug: "nottingham" },
];

export function isMappingAvailable(serviceSlug: string, citySlug: string): boolean {
  return serviceCityMappings.some(
    (m) => m.serviceSlug === serviceSlug && m.citySlug === citySlug
  );
}

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}

export function getCityBySlug(slug: string): City | undefined {
  return cities.find((c) => c.slug === slug);
}

export function getServicesForCity(citySlug: string): Service[] {
  const mappedSlugs = serviceCityMappings
    .filter((m) => m.citySlug === citySlug)
    .map((m) => m.serviceSlug);
  return services.filter((s) => mappedSlugs.includes(s.slug));
}

export function getCitiesForService(serviceSlug: string): City[] {
  const mappedSlugs = serviceCityMappings
    .filter((m) => m.serviceSlug === serviceSlug)
    .map((m) => m.citySlug);
  return cities.filter((c) => mappedSlugs.includes(c.slug));
}

export const faqs: FAQItem[] = [
  {
    question: "How does Totalserve work?",
    answer:
      "You submit an enquiry for the service you need and your location. Our team reviews your request and assigns the most suitable, vetted professional from our artisan network. You'll be contacted directly to arrange the work.",
    category: "general",
  },
  {
    question: "Can I book an artisan directly through the website?",
    answer:
      "No — Totalserve operates differently from a booking marketplace. We carefully review each enquiry and match you with the right professional for your specific job. This ensures quality and the right skills for every task.",
    category: "general",
  },
  {
    question: "How quickly will I hear back after submitting an enquiry?",
    answer:
      "We aim to respond to all enquiries within 2–4 hours during business hours (Mon–Fri, 8am–6pm). For emergency or urgent requests, we prioritise these and will respond as quickly as possible.",
    category: "general",
  },
  {
    question: "Are the tradespeople vetted and insured?",
    answer:
      "Yes. All artisans in the Totalserve network are vetted before joining. We check qualifications, certifications (such as Gas Safe registration for gas engineers), public liability insurance, and references.",
    category: "artisans",
  },
  {
    question: "What areas does Totalserve cover?",
    answer:
      "We currently serve major UK cities including London, Manchester, Birmingham, Leeds, Liverpool, Glasgow, Bristol, Sheffield, Edinburgh and more. We are continually expanding our network.",
    category: "general",
  },
  {
    question: "How do I register as an artisan or tradesperson?",
    answer:
      "Visit our 'Register as an Artisan' page and complete the registration form. Our team will review your details, qualifications and experience before welcoming you into the Totalserve network.",
    category: "artisans",
  },
  {
    question: "Is there a fee to submit an enquiry?",
    answer:
      "No. Submitting an enquiry through Totalserve is completely free for customers. There is no charge to use our matching service.",
    category: "pricing",
  },
  {
    question: "What happens if my service or city is not listed?",
    answer:
      "If your service or location isn't currently covered, you can still submit a general enquiry through our contact page. We are continuously expanding our network and may be able to help or direct you appropriately.",
    category: "general",
  },
];

export const trustStats: TrustStat[] = [
  { value: "2,500+", label: "Enquiries Handled", icon: "📋" },
  { value: "500+", label: "Vetted Artisans", icon: "✅" },
  { value: "50+", label: "UK Cities Covered", icon: "📍" },
  { value: "98%", label: "Satisfaction Rate", icon: "⭐" },
];
