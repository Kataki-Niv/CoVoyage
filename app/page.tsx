import { FeatureNavigation } from "@/components/home/FeatureNavigation";
import { FeatureSection } from "@/components/home/FeatureSection";
import { HeroSection } from "@/components/home/HeroSection";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

const features = [
  {
    id: "tribe",
    eyebrow: "Companion matching",
    title: "Find Your Tribe",
    description:
      "Meet travelers who share your interests, destinations, travel style, budget, and travel dates.",
    ctaLabel: "Explore",
    href: "/tribe",
    imageSide: "left" as const,
    palette: "sage" as const,
  },
  {
    id: "vibe",
    eyebrow: "Culture before arrival",
    title: "Explore Local Vibe",
    description:
      "Discover local culture, traditions, food, etiquette, hidden gems, and practical travel information before your journey begins.",
    ctaLabel: "Explore",
    href: "/vibe",
    imageSide: "right" as const,
    palette: "sand" as const,
  },
  {
    id: "journal",
    eyebrow: "Stories from the road",
    title: "CoVoyage Journal",
    description:
      "Read inspiring travel stories, itineraries, travel guides, and experiences shared by fellow travelers.",
    ctaLabel: "Read Blogs",
    href: "/blogs",
    imageSide: "left" as const,
    palette: "rose" as const,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fbf8f2] text-stone-900">
      <Navbar />
      <main>
        <HeroSection />
        <FeatureNavigation />
        <div className="relative overflow-hidden bg-[#fbf8f2]">
          {features.map((feature) => (
            <FeatureSection key={feature.id} {...feature} />
          ))}
          <section
            className="mx-auto max-w-7xl scroll-mt-28 px-5 pb-20 pt-4 sm:px-8"
            id="faq"
          >
            <div className="border-y border-stone-200 py-10 text-center">
              <p className="text-xs font-medium uppercase tracking-[0.34em] text-stone-500">
                FAQ
              </p>
              <h2 className="mt-4 font-serif text-3xl text-stone-900">
                Travel questions, answered beautifully.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-stone-600">
                This section is reserved for the next iteration, where common
                CoVoyage questions can be organized without changing the page
                architecture.
              </p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
