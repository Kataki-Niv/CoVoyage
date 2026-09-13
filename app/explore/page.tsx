import type { Metadata } from "next";

import { ExplorePage } from "@/components/explore/ExplorePage";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { fetchFeaturedDestinations } from "@/lib/destinationApi";

export const metadata: Metadata = {
  title: "Explore | CoVoyage",
  description:
    "Discover destinations, local culture, seasonal travel ideas, and community-inspired guidance with CoVoyage.",
};

export const dynamic = "force-dynamic";

export default async function ExploreRoute() {
  const featuredSnapshot = await fetchFeaturedDestinations();

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#F5F1E8]">
      <Navbar />
      <ExplorePage featuredSnapshot={featuredSnapshot} />
      <Footer />
    </div>
  );
}
