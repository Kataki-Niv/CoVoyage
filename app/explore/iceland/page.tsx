import type { Metadata } from "next";

import { CountryExplorePage } from "@/app/explore/CountryExplorePage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Iceland | CoVoyage Explore",
  description:
    "Explore Iceland through CoVoyage destination intelligence, curated journeys, community tips, local culture, and current-month scenic travel guidance.",
};

export default async function IcelandExploreRoute() {
  return <CountryExplorePage countrySlug="iceland" />;
}
