import { DestinationPage } from "@/components/explore/DestinationPage";
import type { DestinationData } from "@/components/explore/destinationData";
import { destinations } from "@/components/explore/destinationData";
import { mapBackendDestinationToDestinationData } from "@/components/explore/destinationMapper";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { fetchDestination } from "@/lib/destinationApi";

type DynamicExploreRouteProps = {
  params: Promise<{
    countrySlug: string;
  }>;
};

const countryNamesBySlug: Record<string, string> = {
  czechia: "Czechia",
  india: "India",
  indonesia: "Indonesia",
  ireland: "Ireland",
  italy: "Italy",
  japan: "Japan",
  morocco: "Morocco",
  portugal: "Portugal",
  "south-korea": "South Korea",
  "united-arab-emirates": "United Arab Emirates",
  "united-kingdom": "United Kingdom",
  "united-states": "United States",
};

function getCountryName(countrySlug: string) {
  return (
    countryNamesBySlug[countrySlug] ??
    countrySlug
      .split("-")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

export default async function DynamicExploreRoute({
  params,
}: DynamicExploreRouteProps) {
  const { countrySlug } = await params;
  const backendDestination = await fetchDestination(countrySlug);
  const countryName = backendDestination?.country.name ?? getCountryName(countrySlug);

  const fallbackDestination: DestinationData = {
      ...destinations.japan,
      key: countrySlug,
      country: countryName,
      heroTitle: `Planning to Visit ${countryName}?`,
      intro: `You searched for ${countryName}, so this guide gives you a simple starting point for local culture, seasonal planning, and practical travel context.`,
      heroImage:
        backendDestination?.country.hero_media?.url ?? destinations.japan.heroImage,
      heroImageAlt:
        backendDestination?.country.hero_media?.alt ??
        backendDestination?.country.hero_media?.alt_text ??
        `${countryName} travel scene`,
    };
  const destination = backendDestination
    ? mapBackendDestinationToDestinationData(backendDestination, fallbackDestination)
    : fallbackDestination;

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#F5F1E8]">
      <Navbar />
      <DestinationPage destination={destination} />
      <Footer />
    </div>
  );
}
