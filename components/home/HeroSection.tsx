"use client";

import { motion } from "framer-motion";

import { DecorativeElement } from "@/components/home/DecorativeElements";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#fbf8f2] px-4 pb-10 pt-10 sm:px-8 lg:pb-14">
      <DecorativeElement className="-left-8 top-28 hidden lg:grid" variant="stamp" />
      <DecorativeElement className="right-6 top-24 h-28 w-28" variant="compass" />
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-7xl"
        initial={{ opacity: 0, y: 18 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="mb-10 text-center">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.42em] text-stone-500">
            A social atlas for thoughtful travelers
          </p>
          <h1 className="mx-auto max-w-4xl font-serif text-5xl leading-tight text-stone-900 sm:text-6xl lg:text-7xl">
            The Art of Shared Discovery
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-stone-600 sm:text-lg">
            Travel is not just about the places you visit; it is about the
            people you meet along the way.
          </p>
        </div>

        <div className="relative min-h-[520px] overflow-hidden rounded-[4px] bg-stone-900 shadow-2xl shadow-stone-300/40">
          <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(39,33,28,0.76),rgba(39,33,28,0.18)_48%,rgba(251,248,242,0.38)),radial-gradient(circle_at_72%_38%,rgba(255,255,255,0.38),transparent_22%),linear-gradient(135deg,#7d725e_0%,#b6a081_34%,#d8c7a7_52%,#778b7d_75%,#c6b191_100%)]" />
          <div className="absolute inset-y-0 right-0 hidden w-[42%] border-l border-white/40 bg-[linear-gradient(160deg,rgba(255,255,255,0.72),rgba(244,234,218,0.45)),repeating-linear-gradient(0deg,transparent_0_22px,rgba(120,99,76,0.18)_23px_24px)] lg:block" />
          <DecorativeElement className="bottom-10 right-12 h-36 w-52 text-white/55" variant="postcard" />
          <DecorativeElement className="left-10 top-12 h-24 w-60 text-white/60" variant="route" />

          <div className="relative z-10 flex min-h-[520px] items-end px-6 py-10 sm:px-12 lg:px-16">
            <div className="max-w-2xl text-white">
              <p className="mb-6 w-fit rounded-full border border-white/40 px-4 py-2 text-xs uppercase tracking-[0.28em] text-white/80">
                First stamp in the journal
              </p>
              <p className="font-serif text-6xl leading-none sm:text-8xl">
                Welcome to
              </p>
              <p className="mt-5 text-2xl uppercase tracking-[0.32em] text-white/85 sm:text-3xl">
                CoVoyage
              </p>
              <p className="mt-6 max-w-lg text-base leading-8 text-white/85">
                Plan beautiful journeys with people who share your pace,
                interests, dates, and sense of wonder.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
