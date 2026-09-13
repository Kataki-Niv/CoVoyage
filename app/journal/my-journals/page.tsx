import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

import { MyJournalsPageClient } from "./MyJournalsPageClient";

export const metadata = {
  title: "My Journals | CoVoyage Journal",
  description: "Manage your published CoVoyage journals and saved drafts.",
};

export default function MyJournalsPage() {
  return (
    <div className="min-h-screen bg-[#050505]">
      <Navbar />
      <MyJournalsPageClient />
      <Footer />
    </div>
  );
}
