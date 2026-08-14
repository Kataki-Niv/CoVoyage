import type { Metadata } from "next";

import { DestinationPage } from "@/components/explore/DestinationPage";
import { destinations } from "@/components/explore/destinationData";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Japan | CoVoyage Explore",
  description:
    "Explore Japan through CoVoyage destination intelligence, curated journeys, community tips, local culture, and travel preparation guidance.",
};

export default function JapanExploreRoute() {
  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#F5F1E8]">
      <Navbar />
      <DestinationPage destination={destinations.japan} />
      <Footer />
    </div>
  );
}
