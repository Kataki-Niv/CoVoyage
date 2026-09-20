import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

const steps = [
  {
    number: "01",
    title: "Create Your Profile",
    description:
      "Tell CoVoyage about yourself and the kind of journey you're looking for.",
    bullets: [
      "Choose your destination",
      "Add your travel dates",
      "Set your budget",
      "Select your travel style and preferences",
    ],
    image: "/how%20it%20works/step1.jpg",
    imageAlt: "Traveler planning a journey outdoors",
  },
  {
    number: "02",
    title: "Find Your Travel Community",
    description:
      "Discover travelers whose journeys and preferences align with yours.",
    bullets: [
      "Explore compatible co-travelers",
      "Compare destinations",
      "Check overlapping travel dates",
      "Discover shared interests and travel preferences",
    ],
    image: "/how%20it%20works/step2.jpg",
    imageAlt: "Friends traveling together on a sunny day",
  },
  {
    number: "03",
    title: "Discover Your Destination",
    description:
      "Understand your destination before you arrive through local culture, practical information, community tips, and safety guidance.",
    bullets: [
      "Discover local culture",
      "Learn practical destination information",
      "Explore community tips",
      "Check safety and preparation information",
      "Get useful insights before you arrive",
    ],
    image: "/how%20it%20works/step3.jpg",
    imageAlt: "Historic destination street with local culture",
  },
  {
    number: "04",
    title: "Get Ready For Your Journey",
    description:
      "Prepare for your journey with travel inspiration, practical information, and useful essentials from the CoVoyage community.",
    bullets: [
      "Read travel stories, guides, and tips from the CoVoyage community",
      "Discover useful Travel Essentials for your trip",
      "Check important travel preparations",
      "Prepare for your destination",
      "Start your journey with confidence",
    ],
    image: "/how%20it%20works/step4.jpg",
    imageAlt: "Packed travel bag ready for a trip",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-[#f8f4ea]">
      <Navbar />
      <main className="overflow-hidden bg-[#050505]">
        <section className="px-5 pb-8 pt-12 sm:px-8 lg:px-16 lg:pb-10 lg:pt-16">
          <div className="mx-auto max-w-7xl text-center">
            <div className="mx-auto max-w-4xl">
              <p className="text-xs font-medium uppercase tracking-[0.34em] text-white/45">
                The CoVoyage Guide
              </p>
              <h1 className="mx-auto mt-5 max-w-4xl text-3xl font-semibold uppercase leading-[0.98] tracking-[0.08em] text-white sm:text-4xl lg:text-5xl">
                How CoVoyage Works
              </h1>
              <p className="mx-auto mt-6 max-w-xl font-serif text-2xl leading-tight text-white/72 sm:text-3xl">
                Your journey starts with a few simple steps.
              </p>
            </div>
          </div>
        </section>

        <section className="px-5 pb-24 sm:px-8 lg:px-16 lg:pb-32" id="steps">
          <div className="mx-auto max-w-7xl">
            {steps.map((step, index) => (
                <section
                  className={`grid gap-8 border-b border-white/10 pb-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:pb-20 ${
                    index === 0 ? "pt-0" : "pt-14 lg:pt-20"
                  }`}
                  key={step.number}
                >
                  <div className="flex max-w-xl flex-col justify-center">
                    <p className="font-serif text-7xl leading-none text-white/18 sm:text-8xl">
                      {step.number}
                    </p>
                    <h2 className="mt-5 text-3xl font-semibold uppercase tracking-[0.13em] text-white sm:text-4xl">
                      {step.title}
                    </h2>
                    <p className="mt-5 max-w-xl font-serif text-2xl leading-tight text-white/78">
                      {step.description}
                    </p>
                    <ul className="mt-8 grid gap-3 text-sm leading-6 text-white/58">
                      {step.bullets.map((bullet) => (
                        <li className="flex gap-3" key={bullet}>
                          <span className="mt-2 h-px w-6 shrink-0 bg-[#e7cf9d]/70" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="relative min-h-[18rem] overflow-hidden border border-white/10 bg-white/[0.035] sm:min-h-[25rem] lg:min-h-[28rem]">
                    <Image
                      alt={step.imageAlt}
                      className="object-cover transition duration-500 hover:scale-[1.025]"
                      fill
                      sizes="(min-width: 1024px) 55vw, 100vw"
                      src={step.image}
                    />
                    <div className="absolute inset-0 bg-black/14" />
                  </div>
                </section>
              ))}
          </div>
        </section>

        <section className="px-5 pb-24 sm:px-8 lg:px-16 lg:pb-32">
          <div className="mx-auto max-w-7xl border-y border-white/10 py-14 text-center">
            <h2 className="text-4xl font-semibold uppercase leading-tight tracking-[0.12em] text-white sm:text-5xl">
              Ready To Start Your Journey?
            </h2>
            <p className="mx-auto mt-5 max-w-2xl font-serif text-2xl leading-tight text-white/70">
              Find your people. Discover your destination. Make the journey
              yours.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                className="inline-flex items-center justify-center gap-3 border border-white/18 bg-white/12 px-7 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-white transition duration-300 hover:border-white/34 hover:bg-white/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
                href="/tribe"
              >
                Find Your Tribe
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                className="inline-flex items-center justify-center border border-white/18 px-7 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-white transition duration-300 hover:border-white/34 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
                href="/explore"
              >
                Explore Local Vibe
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
