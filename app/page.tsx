import { CovoyageJournalsSection } from "@/components/home/CovoyageJournalsSection";
import { FeatureSection } from "@/components/home/FeatureSection";
import { FindYourTribeSection } from "@/components/home/FindYourTribeSection";
import { HeroSection } from "@/components/home/HeroSection";
import { MasterLocalVibeSection } from "@/components/home/MasterLocalVibeSection";
import { NewWayToTravelSection } from "@/components/home/NewWayToTravelSection";
import { TravelEssentialsSection } from "@/components/home/TravelEssentialsSection";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

const features = [
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505] text-stone-100">
      <Navbar />
      <main>
        <div className="-mt-20">
          <HeroSection />
        </div>
        <div className="relative overflow-hidden bg-[#050505] pt-12">
          <NewWayToTravelSection />
          <FindYourTribeSection />
          <MasterLocalVibeSection />
          <CovoyageJournalsSection />
          <TravelEssentialsSection />
          {features.map((feature) => (
            <FeatureSection key={feature.id} {...feature} />
          ))}
          <section className="mx-auto max-w-7xl scroll-mt-28 px-5 pb-20 pt-4 sm:px-8" id="faq">
            <div className="border-y border-white/10 py-10 text-center">
              <p className="text-xs font-medium uppercase tracking-[0.34em] text-white/45">FAQ</p>
              <h2 className="mt-4 font-serif text-3xl text-[#f8f4ea]">Travel questions, answered beautifully.</h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/62">This section is reserved for the next iteration, where common CoVoyage questions can be organized without changing the page architecture.</p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
