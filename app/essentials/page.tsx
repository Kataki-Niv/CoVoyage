import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

import { EssentialsPageClient } from "./EssentialsPageClient";

export const metadata = {
  title: "CoVoyage Essentials | Travel Preparation",
  description:
    "A premium CoVoyage travel-preparation page with destination essentials, packing checklists, and mock curated gear.",
};

export default function EssentialsPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-[#f8f4ea]">
      <Navbar />
      <EssentialsPageClient />
      <Footer />
    </div>
  );
}
