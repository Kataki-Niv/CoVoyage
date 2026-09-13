import type { Metadata } from "next";

import { CountryExplorePage } from "@/app/explore/CountryExplorePage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Guatemala | CoVoyage Explore",
  description:
    "Explore Guatemala through CoVoyage destination intelligence, curated journeys, community tips, local culture, and current-month value travel guidance.",
};

export default async function GuatemalaExploreRoute() {
  return <CountryExplorePage countrySlug="guatemala" />;
}
