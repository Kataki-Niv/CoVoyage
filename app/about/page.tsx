import { ArrowRight, Compass, Handshake, Luggage } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

const beliefs = [
  {
    number: "01",
    title: "People Before Plans",
    copy:
      "The right travel companion can turn an ordinary itinerary into a memorable journey.",
    Icon: Compass,
  },
  {
    number: "02",
    title: "Understanding Before Arriving",
    copy:
      "Every destination has a culture, rhythm and story worth knowing beyond the usual tourist checklist.",
    Icon: Handshake,
  },
  {
    number: "03",
    title: "Preparation Creates Freedom",
    copy:
      "Being prepared isn't about planning every moment. It's about knowing the important things are taken care of.",
    Icon: Luggage,
  },
];

const visionItems = [
  {
    title: "Connecting People",
    copy: "Helping travelers discover people whose journeys align with theirs.",
  },
  {
    title: "Understanding Places",
    copy: "Making local context and destination knowledge easier to discover.",
  },
  {
    title: "Making Travel More Human",
    copy:
      "Using technology to remove friction without taking away the human side of travel.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-[#f8f4ea]">
      <Navbar />
      <main className="overflow-hidden bg-[#050505]">
        <section className="px-5 pb-12 pt-10 sm:px-8 lg:px-16">
          <div
            className="relative mx-auto max-w-7xl overflow-hidden border border-white/10 bg-white/[0.035] px-6 py-14 sm:px-10 lg:px-14 lg:py-18"
          >
            <Image
              alt="Atmospheric travel landscape"
              className="object-cover brightness-110"
              fill
              priority
              sizes="100vw"
              src="/about_hero.jpg"
            />
            <div className="absolute inset-0 bg-black/48" />
            <div className="relative z-10 max-w-4xl">
              <p className="text-xs font-medium uppercase tracking-[0.34em] text-white/62">
                Our Philosophy
              </p>
              <h1 className="mt-5 font-serif text-3xl leading-[0.96] text-white sm:text-5xl">
                Travel Was Never Meant To Be A Solo Sport.
                <br />
                Nor A Leap In The Dark.
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-white/72">
                CoVoyage was created to bring human connection, destination
                understanding, and thoughtful preparation into one travel
                experience.
              </p>
            </div>
          </div>
        </section>

        <section className="px-5 py-14 sm:px-8 lg:px-16">
          <div
            className="mx-auto grid max-w-7xl gap-8 border-b border-white/10 pb-14 lg:grid-cols-[0.36fr_0.64fr] lg:gap-16"
          >
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.34em] text-white/42">
                The Beginning
              </p>
              <h2 className="mt-5 text-3xl font-semibold uppercase leading-tight tracking-[0.12em] text-white sm:text-4xl">
                Born From A Simple Question.
              </h2>
            </div>
            <div className="grid gap-5 text-base leading-8 text-white/64">
              <p className="font-serif text-3xl leading-tight text-white sm:text-4xl">
                What if finding someone to travel with was as easy as finding
                somewhere to go?
              </p>
              <p>
                Travel can be exciting, but figuring out who to travel with,
                where to go, and what to know before arriving can often feel
                fragmented. CoVoyage began with the idea of bringing these pieces
                together - helping travelers find people who share their journey
                while giving them the context they need to experience a new place
                more meaningfully.
              </p>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#e7cf9d]">
                That question became CoVoyage.
              </p>
            </div>
          </div>
        </section>

        <section className="px-5 py-14 sm:px-8 lg:px-16">
          <div
            className="mx-auto max-w-7xl"
          >
            <div className="flex items-center gap-6">
              <h2 className="shrink-0 text-2xl font-semibold uppercase tracking-[0.14em] text-white sm:text-3xl">
                3 Guiding Beliefs
              </h2>
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {beliefs.map((belief) => (
                <article
                  className="min-h-56 border border-white/14 bg-white/[0.02] p-6 transition duration-300 hover:border-white/26 hover:bg-white/[0.045]"
                  key={belief.number}
                >
                  <div className="flex items-start justify-between gap-6">
                    <span className="font-serif text-4xl leading-none text-[#e7cf9d]/72">
                      {belief.number}
                    </span>
                    <belief.Icon className="h-8 w-8 text-[#e7cf9d]/56" strokeWidth={1.3} />
                  </div>
                  <h3 className="mt-7 max-w-[17rem] text-lg font-semibold leading-tight text-white">
                    {belief.title}
                  </h3>
                  <p className="mt-4 max-w-[20rem] text-sm leading-6 text-white/62">
                    {belief.copy}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-14 sm:px-8 lg:px-16">
          <div
            className="mx-auto grid max-w-7xl gap-8 border-y border-white/10 py-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-14"
          >
            <div className="relative min-h-[22rem] overflow-hidden border border-white/10 bg-white/[0.035] sm:min-h-[30rem]">
              <Image
                alt="Travelers looking across a destination"
                className="object-cover"
                fill
                sizes="(min-width: 1024px) 48vw, 100vw"
                src="/vision.jpg"
              />
              <div className="absolute inset-0 bg-black/16" />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.34em] text-white/42">
                Vision
              </p>
              <h2 className="mt-5 font-serif text-4xl leading-tight text-white sm:text-5xl">
                The World We Want To Explore
              </h2>
              <div className="mt-8 grid gap-6">
                {visionItems.map((item) => (
                  <div className="border-t border-white/10 pt-5" key={item.title}>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-[#e7cf9d]">
                      {item.title}
                    </h3>
                    <p className="mt-3 max-w-xl text-base leading-7 text-white/62">
                      {item.copy}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 py-14 sm:px-8 lg:px-16">
          <div
            className="mx-auto max-w-7xl border-b border-white/10 pb-14"
          >
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.34em] text-white/42">
                A Note From The Founder
              </p>
            </div>

            <blockquote className="mt-8">
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#e7cf9d]">
                Nivedana Kataki
              </p>
              <p className="mt-2 text-xs font-medium uppercase tracking-[0.22em] text-white/42">
                Founder & Creator, CoVoyage
              </p>
              <p className="mt-8 font-serif text-xl leading-tight text-white sm:text-3xl">
                &ldquo;I wanted to build something that made travel feel a little
                less unfamiliar - not just by helping people decide where to go,
                but by helping them discover who they could go with and what they
                could discover along the way.&rdquo;
              </p>
            </blockquote>
          </div>
        </section>

        <section className="px-5 pb-24 pt-12 sm:px-8 lg:px-16 lg:pb-32">
          <div
            className="relative mx-auto max-w-7xl overflow-hidden border border-white/10 bg-white/[0.035] px-6 py-12 text-center sm:px-10 lg:py-16"
          >
            <Image
              alt="Atmospheric closing travel scene"
              className="object-cover brightness-110"
              fill
              sizes="100vw"
              src="/covoyage-hero-tree.jpg"
            />
            <div className="absolute inset-0 bg-black/46" />
            <div className="relative z-10 mx-auto max-w-4xl">
              <h2 className="font-serif text-4xl leading-tight text-white sm:text-6xl">
                Wherever You&apos;re Headed,
                <br />
                Don&apos;t Go It Alone.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/68">
                Find your people. Understand your destination. Make the journey
                yours.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  className="inline-flex items-center justify-center gap-3 border border-white/18 bg-white/12 px-7 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-white transition duration-300 hover:border-white/34 hover:bg-white/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
                  href="/tribe"
                >
                  Find Your Tribe
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  className="inline-flex items-center justify-center border border-white/18 px-7 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-white transition duration-300 hover:border-white/34 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
                  href="/how-it-works"
                >
                  How It Works
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
