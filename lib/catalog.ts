import { City, Service, ServiceCityMapping } from "@/lib/types";
import {
  services as defaultServices,
  cities as defaultCities,
  serviceCityMappings as defaultMappings,
} from "@/lib/data";
import { getSettingsByKeys } from "@/lib/site-settings";

type CatalogData = {
  services: Service[];
  cities: City[];
  mappings: ServiceCityMapping[];
};

const catalogKeys = ["catalog.services", "catalog.cities", "catalog.mappings"];

function isServiceArray(value: unknown): value is Service[] {
  return Array.isArray(value) && value.every((item) => item && typeof item === "object" && "slug" in item && "name" in item);
}

function isCityArray(value: unknown): value is City[] {
  return Array.isArray(value) && value.every((item) => item && typeof item === "object" && "slug" in item && "name" in item);
}

function isMappingArray(value: unknown): value is ServiceCityMapping[] {
  return Array.isArray(value) && value.every((item) => item && typeof item === "object" && "serviceSlug" in item && "citySlug" in item);
}

export async function getCatalogData(): Promise<CatalogData> {
  const settingMap = await getSettingsByKeys(catalogKeys);

  const services = settingMap.get("catalog.services");
  const cities = settingMap.get("catalog.cities");
  const mappings = settingMap.get("catalog.mappings");

  return {
    services: isServiceArray(services) ? services : defaultServices,
    cities: isCityArray(cities) ? cities : defaultCities,
    mappings: isMappingArray(mappings) ? mappings : defaultMappings,
  };
}

export async function getServiceBySlug(slug: string) {
  const { services } = await getCatalogData();
  return services.find((service) => service.slug === slug);
}

export async function getCityBySlug(slug: string) {
  const { cities } = await getCatalogData();
  return cities.find((city) => city.slug === slug);
}

export async function getServicesForCity(citySlug: string) {
  const { services, mappings } = await getCatalogData();
  const mappedSlugs = mappings.filter((mapping) => mapping.citySlug === citySlug).map((mapping) => mapping.serviceSlug);
  return services.filter((service) => mappedSlugs.includes(service.slug));
}

export async function getCitiesForService(serviceSlug: string) {
  const { cities, mappings } = await getCatalogData();
  const mappedSlugs = mappings.filter((mapping) => mapping.serviceSlug === serviceSlug).map((mapping) => mapping.citySlug);
  return cities.filter((city) => mappedSlugs.includes(city.slug));
}

export async function isMappingAvailable(serviceSlug: string, citySlug: string) {
  const { mappings } = await getCatalogData();
  return mappings.some((mapping) => mapping.serviceSlug === serviceSlug && mapping.citySlug === citySlug);
}
