import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

import { EssentialsBagPageClient } from "./EssentialsBagPageClient";

export const metadata = {
  title: "My Essentials Bag | CoVoyage",
  description: "Review and manage your saved CoVoyage travel essentials.",
};

export default function EssentialsBagPage() {
  return (
    <div
      className="min-h-screen bg-[#050505] text-[#f8f4ea]"
      style={{ backgroundColor: "#050505" }}
    >
      <Navbar />
      <EssentialsBagPageClient />
      <Footer />
    </div>
  );
}
