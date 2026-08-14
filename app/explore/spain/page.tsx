import type { Metadata } from "next";

import { DestinationPage } from "@/components/explore/DestinationPage";
import { mapBackendDestinationToDestinationData } from "@/components/explore/destinationMapper";
import { destinations } from "@/components/explore/destinationData";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { fetchDestination } from "@/lib/destinationApi";

export const metadata: Metadata = {
  title: "Spain | CoVoyage Explore",
  description:
    "Explore Spain through CoVoyage destination intelligence, curated journeys, community tips, local culture, and August 2026 festival guidance.",
};

export default async function SpainExploreRoute() {
  const backendDestination = await fetchDestination("spain");
  const destination = mapBackendDestinationToDestinationData(
    backendDestination,
    destinations.spain,
  );

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#F5F1E8]">
      <Navbar />
      <DestinationPage destination={destination} />
      <Footer />
    </div>
  );
}
