import { CovoyageJournalsSection } from "@/components/home/CovoyageJournalsSection";
import type { ComponentProps } from "react";

import { FeatureSection } from "@/components/home/FeatureSection";
import { FindYourTribeSection } from "@/components/home/FindYourTribeSection";
import { HeroSection } from "@/components/home/HeroSection";
import { MasterLocalVibeSection } from "@/components/home/MasterLocalVibeSection";
import { NewWayToTravelSection } from "@/components/home/NewWayToTravelSection";
import { TravelEssentialsSection } from "@/components/home/TravelEssentialsSection";
import { TravelerReviewsStrip } from "@/components/home/TravelerReviewsStrip";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

const features: ComponentProps<typeof FeatureSection>[] = [];

const faqs = [
  {
    question: "What is CoVoyage?",
    answer:
      "CoVoyage is an AI-powered social travel platform that helps travelers find compatible co-travelers, understand destinations through local insights, and prepare for their journeys.",
  },
  {
    question: "How does Find Your Tribe work?",
    answer:
      "Travelers create a profile with their destinations, travel dates, preferences, and travel style. CoVoyage uses this information to find compatible travelers and rank potential matches.",
  },
  {
    question: "Can I find people traveling to the same destination?",
    answer:
      "Yes. Destination overlap is one of the important factors used when finding compatible co-travelers.",
  },
  {
    question: "Can I find group travel opportunities?",
    answer:
      "Yes. CoVoyage is designed to support both individual co-traveler connections and group travel experiences.",
  },
  {
    question: "What is Master the Local Vibe?",
    answer:
      "It provides destination intelligence such as local culture, practical information, safety insights, documents, community tips, and other information that helps travelers prepare for a destination.",
  },
  {
    question: "Is CoVoyage only for solo travelers?",
    answer:
      "No. It can be useful for solo travelers, friends looking to expand a group, and travelers interested in meeting compatible people for a shared journey.",
  },
  {
    question: "What information do I need to create a profile?",
    answer:
      "Travelers provide information such as their travel preferences, destinations, travel dates, budget, travel style, languages, and other compatibility-related details.",
  },
  {
    question: "Is the travel information personalized?",
    answer:
      "CoVoyage is designed to provide destination information relevant to the place a traveler is exploring, with AI-powered features helping organize and personalize the experience.",
  },
  {
    question: "Is CoVoyage free?",
    answer:
      "Yes. CoVoyage is free to use, so travelers can explore destinations, build their profile, and discover compatible travel connections without a subscription.",
  },
  {
    question: "How do I get started?",
    answer:
      "Create an account, complete your travel profile, explore your potential tribe, and discover the local vibe of your destination.",
  },
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
          <TravelerReviewsStrip />

          <section className="mx-auto max-w-7xl scroll-mt-28 px-5 pb-20 pt-4 sm:px-8" id="faq">
            <div className="border-y border-white/10 py-12">
              <div className="mx-auto max-w-3xl text-center">
                <p className="text-xs font-medium uppercase tracking-[0.34em] text-white/45">FAQ</p>
                <h2 className="mt-4 font-serif text-3xl uppercase leading-tight text-[#f8f4ea] sm:text-4xl">
                  Travel Questions, Answered Beautifully.
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/62">
                  Everything you need to know before you begin your journey with CoVoyage.
                </p>
              </div>

              <div className="mx-auto mt-10 max-w-4xl divide-y divide-white/10 border-y border-white/10">
                {faqs.map((faq) => (
                  <details className="group" key={faq.question} name="covoyage-faq">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-6 text-left text-base font-medium text-[#f8f4ea] outline-none transition duration-300 hover:text-white focus-visible:ring-2 focus-visible:ring-white/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505] [&::-webkit-details-marker]:hidden">
                      <span>{faq.question}</span>
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-white/14 text-xl leading-none text-white/62 transition duration-300 group-open:border-white/28 group-open:text-white">
                        <span className="group-open:hidden">+</span>
                        <span className="hidden group-open:block">-</span>
                      </span>
                    </summary>
                    <p className="max-w-3xl pb-6 pr-12 text-sm leading-7 text-white/62">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
