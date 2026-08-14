import type { Metadata } from "next";

import { DestinationPage } from "@/components/explore/DestinationPage";
import { mapBackendDestinationToDestinationData } from "@/components/explore/destinationMapper";
import { destinations } from "@/components/explore/destinationData";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { fetchDestination } from "@/lib/destinationApi";

export const metadata: Metadata = {
  title: "Guatemala | CoVoyage Explore",
  description:
    "Explore Guatemala through CoVoyage destination intelligence, curated journeys, community tips, local culture, and August 2026 value travel guidance.",
};

export default async function GuatemalaExploreRoute() {
  const backendDestination = await fetchDestination("guatemala");
  const destination = mapBackendDestinationToDestinationData(
    backendDestination,
    destinations.guatemala,
  );
  const frontendDestination = {
    ...destination,
    heroImage: "/destination/gmm.jpg",
    heroImageAlt: "Antigua Guatemala street with volcano in the background",
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#F5F1E8]">
      <Navbar />
      <DestinationPage destination={frontendDestination} />
      <Footer />
    </div>
  );
}
