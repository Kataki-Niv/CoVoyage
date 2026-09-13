import type { Metadata } from "next";

import { CountryExplorePage } from "@/app/explore/CountryExplorePage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Spain | CoVoyage Explore",
  description:
    "Explore Spain through CoVoyage destination intelligence, curated journeys, community tips, local culture, and current-month festival guidance.",
};

export default async function SpainExploreRoute() {
  return <CountryExplorePage countrySlug="spain" />;
}
