import type { Metadata } from "next";

import { DestinationPage } from "@/components/explore/DestinationPage";
import { mapBackendDestinationToDestinationData } from "@/components/explore/destinationMapper";
import { destinations } from "@/components/explore/destinationData";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { fetchDestination } from "@/lib/destinationApi";

export const metadata: Metadata = {
  title: "Iceland | CoVoyage Explore",
  description:
    "Explore Iceland through CoVoyage destination intelligence, curated journeys, community tips, local culture, and August 2026 scenic travel guidance.",
};

const porsmorkImage =
  "https://i.pinimg.com/1200x/8b/23/11/8b2311edf1ff0293d24082602777a7eb.jpg";

function cleanPorsmorkText(text: string) {
  return text
    .replaceAll("ÃžÃ³rsmÃ¶rk", "Porsmork")
    .replaceAll("Þórsmörk", "Porsmork")
    .replaceAll("Thorsmork", "Porsmork");
}

export default async function IcelandExploreRoute() {
  const backendDestination = await fetchDestination("iceland");
  const destination = mapBackendDestinationToDestinationData(
    backendDestination,
    destinations.iceland,
  );
  const frontendDestination = {
    ...destination,
    journeyPlaces: destination.journeyPlaces.map((place) => {
      const cleanedName = cleanPorsmorkText(place.name);
      const isPorsmork =
        cleanedName === "Porsmork" ||
        place.name.includes("Ãž") ||
        place.name.includes("Þ") ||
        place.name.toLowerCase().includes("thorsmork");

      return {
        ...place,
        name: cleanedName,
        image: isPorsmork ? porsmorkImage : place.image,
        imageAlt: isPorsmork
          ? "Mount Fuji reflected in a lake at sunset"
          : place.imageAlt,
        story: cleanPorsmorkText(place.story),
        facts: place.facts.map((fact) => ({
          ...fact,
          value: cleanPorsmorkText(fact.value),
        })),
        localVibe: place.localVibe.map(cleanPorsmorkText),
        communityTips: place.communityTips.map((tip) => ({
          ...tip,
          location: cleanPorsmorkText(tip.location),
          quote: cleanPorsmorkText(tip.quote),
        })),
      };
    }),
    goodToKnow: destination.goodToKnow.map((section) => ({
      ...section,
      content: cleanPorsmorkText(section.content),
    })),
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#F5F1E8]">
      <Navbar />
      <DestinationPage destination={frontendDestination} />
      <Footer />
    </div>
  );
}
