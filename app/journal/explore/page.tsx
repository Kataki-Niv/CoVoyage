import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

import { JournalExploreClient } from "./JournalExploreClient";

export const metadata = {
  title: "Explore Journals | CoVoyage Journal",
  description: "A vertical CoVoyage Journal feed for stories, guides, media, and tips.",
};

export default async function JournalExplorePage({
  searchParams,
}: {
  searchParams: Promise<{
    journal?: string;
  }>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <div className="min-h-screen bg-[#050505]">
      <Navbar />
      <JournalExploreClient initialJournal={resolvedSearchParams.journal || ""} />
      <Footer />
    </div>
  );
}
