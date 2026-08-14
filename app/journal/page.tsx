import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

import { JournalPageClient } from "./JournalPageClient";

export const metadata = {
  title: "CoVoyage Journal | Stories from the Road",
  description:
    "Community travel journals, photos, videos, guides, and field notes from CoVoyage travelers.",
};

export default function JournalPage() {
  return (
    <div className="min-h-screen bg-[#050505]">
      <Navbar />
      <JournalPageClient />
      <Footer />
    </div>
  );
}
