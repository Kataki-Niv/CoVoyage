import type { Metadata } from "next";

import { ExplorePage } from "@/components/explore/ExplorePage";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Explore | CoVoyage",
  description:
    "Discover destinations, local culture, seasonal travel ideas, and community-inspired guidance with CoVoyage.",
};

export default function ExploreRoute() {
  return (
    <div className="min-h-screen bg-[#fbf8f2] text-stone-900">
      <Navbar />
      <ExplorePage />
      <Footer />
    </div>
  );
}
