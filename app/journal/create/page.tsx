import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

import { CreateJournalPageClient } from "./CreateJournalPageClient";

export const metadata = {
  title: "Create Journal | CoVoyage Journal",
  description: "Create a CoVoyage journal post, reel, or text story.",
};

export default function CreateJournalPage() {
  return (
    <div className="min-h-screen bg-[#050505]">
      <Navbar />
      <CreateJournalPageClient />
      <Footer />
    </div>
  );
}
