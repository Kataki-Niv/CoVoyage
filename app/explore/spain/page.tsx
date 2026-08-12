import type { Metadata } from "next";

import { DestinationPage } from "@/components/explore/DestinationPage";
import { destinations } from "@/components/explore/destinationData";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Spain | CoVoyage Explore",
  description:
    "Explore Spain through CoVoyage destination intelligence, curated journeys, community tips, local culture, and August 2026 festival guidance.",
};

export default function SpainExploreRoute() {
  return (
    <div className="min-h-screen bg-[#fbf8f2] text-stone-900">
      <Navbar />
      <DestinationPage destination={destinations.spain} />
      <Footer />
    </div>
  );
}
