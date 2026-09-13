import { CountryExplorePage } from "@/app/explore/CountryExplorePage";

export const dynamic = "force-dynamic";

type DynamicExploreRouteProps = {
  params: Promise<{
    countrySlug: string;
  }>;
};

export default async function DynamicExploreRoute({
  params,
}: DynamicExploreRouteProps) {
  const { countrySlug } = await params;
  return <CountryExplorePage countrySlug={countrySlug} />;
}
