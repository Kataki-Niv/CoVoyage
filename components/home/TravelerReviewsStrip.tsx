"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import Image from "next/image";

const reviews = [
  {
    name: "Marco",
    location: "Germany",
    quote:
      "I came to CoVoyage looking for someone who shared my travel style. I left with a trip I never would have planned alone.",
    image: "/reviews/1.jpg",
  },
  {
    name: "Soniya",
    location: "Greece",
    quote:
      "The local insights made planning my first trip to Japan so much easier. It felt like having a friend who had already been there.",
    image: "/reviews/2.jpg",
  },
  {
    name: "Bruce",
    location: "Australia",
    quote:
      "Finding people with the same destination and travel dates made group travel feel completely different.",
    image: "/reviews/3.jpg",
  },
  {
    name: "Plabo",
    location: "Sweden",
    quote:
      "CoVoyage made the whole process feel less like planning a trip and more like discovering one.",
    image: "/reviews/4.jpg",
  },
];

function Rating() {
  return (
    <span aria-label="Five star review" className="flex items-center gap-1 text-[#e7cf9d]">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          aria-hidden="true"
          className="h-3.5 w-3.5 fill-current"
          key={index}
          strokeWidth={1.5}
        />
      ))}
    </span>
  );
}

export function TravelerReviewsStrip() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const activeReview = reviews[activeIndex];

  const showReview = (index: number) => {
    setActiveIndex((index + reviews.length) % reviews.length);
  };

  useEffect(() => {
    if (isPaused) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % reviews.length);
    }, 5600);

    return () => window.clearInterval(timer);
  }, [isPaused]);

  return (
    <section
      className="scroll-mt-28 bg-[#050505] px-5 pb-14 pt-2 text-[#f8f4ea] sm:px-8 lg:px-16"
      id="reviews"
    >
      <div
        className="mx-auto max-w-7xl border-y border-white/10 py-8"
        onBlur={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <p className="text-xs font-medium uppercase tracking-[0.34em] text-white/45">
          Travellers Say It Best
        </p>

        <div className="mt-6 grid gap-6 md:h-[19.5rem] md:grid-cols-[0.34fr_0.66fr] md:items-stretch lg:h-[21rem]">
          <div className="relative h-40 overflow-hidden border border-white/10 bg-white/[0.035] sm:h-48 md:h-full">
            <AnimatePresence mode="wait">
              <motion.div
                animate={{ opacity: 1, x: 0 }}
                className="absolute inset-0"
                exit={{ opacity: 0, x: -18 }}
                initial={{ opacity: 0, x: 18 }}
                key={activeReview.image}
                transition={{ duration: 0.45, ease: "easeOut" }}
              >
                <Image
                  alt={`Travel photograph for ${activeReview.name}'s CoVoyage review`}
                  className="object-cover"
                  fill
                  priority={activeIndex === 0}
                  sizes="(min-width: 768px) 34vw, 100vw"
                  src={activeReview.image}
                />
                <div className="absolute inset-0 bg-black/18" />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex min-h-0 flex-col justify-between gap-6 py-1 md:py-3">
            <AnimatePresence mode="wait">
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                initial={{ opacity: 0, y: 10 }}
                key={activeReview.name}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <p className="max-w-3xl font-serif text-2xl leading-tight text-white sm:text-3xl lg:text-[2.35rem]">
                  &ldquo;{activeReview.quote}&rdquo;
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm uppercase tracking-[0.18em] text-white/58">
                  <span>
                    - {activeReview.name} {"\u00b7"} {activeReview.location}
                  </span>
                  <Rating />
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex flex-wrap items-center justify-between gap-5 border-t border-white/10 pt-5">
              <div
                aria-label="Choose a traveler review"
                className="flex items-center gap-2"
                role="tablist"
              >
                {reviews.map((review, index) => {
                  const isActive = index === activeIndex;

                  return (
                    <button
                      aria-label={`Show ${review.name}'s review`}
                      aria-selected={isActive}
                      className={`h-2.5 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505] ${
                        isActive ? "w-8 bg-[#e7cf9d]" : "w-2.5 bg-white/28 hover:bg-white/58"
                      }`}
                      key={review.name}
                      onClick={() => showReview(index)}
                      role="tab"
                      type="button"
                    />
                  );
                })}
              </div>

              <div className="flex items-center gap-3">
                <button
                  aria-label="Show previous traveler review"
                  className="flex h-10 w-10 items-center justify-center border border-white/14 text-white/62 transition duration-300 hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
                  onClick={() => showReview(activeIndex - 1)}
                  type="button"
                >
                  <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
                </button>
                <button
                  aria-label="Show next traveler review"
                  className="flex h-10 w-10 items-center justify-center border border-white/14 text-white/62 transition duration-300 hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
                  onClick={() => showReview(activeIndex + 1)}
                  type="button"
                >
                  <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
