import type { Metadata } from "next";

import { CountryExplorePage } from "@/app/explore/CountryExplorePage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Japan | CoVoyage Explore",
  description:
    "Explore Japan through CoVoyage destination intelligence, curated journeys, community tips, local culture, and travel preparation guidance.",
};

export default async function JapanExploreRoute() {
  return <CountryExplorePage countrySlug="japan" />;
}
