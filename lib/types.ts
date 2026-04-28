export interface Service {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  shortDescription: string;
  commonIssues: string[];
  color: string;
}

export interface City {
  id: string;
  name: string;
  slug: string;
  region: string;
  description: string;
}

export interface ServiceCityMapping {
  serviceSlug: string;
  citySlug: string;
  featured?: boolean;
}

export interface EnquiryFormData {
  fullName: string;
  email: string;
  phone: string;
  serviceNeeded: string;
  city: string;
  postcode: string;
  jobDescription: string;
  urgencyLevel: "standard" | "urgent" | "emergency";
  preferredContact: "email" | "phone" | "whatsapp";
}

export interface ArtisanRegistrationData {
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  tradeCategory: string;
  citiesCovered: string[];
  yearsExperience: string;
  certifications: string;
  profileDescription: string;
  consentGiven: boolean;
}

export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

export interface TrustStat {
  value: string;
  label: string;
  icon: string;
}

export interface Step {
  number: number;
  title: string;
  description: string;
  icon: string;
}
