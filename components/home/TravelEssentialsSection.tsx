"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const essentials = [
  { name: "Travel Backpack", description: "Lightweight carry for longer journeys.", image: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=700&q=82" },
  { name: "Passport Holder", description: "Keep every travel document together.", image: "/travel/3.jpg" },
  { name: "Portable Charger", description: "Stay powered between destinations.", image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=700&q=82" },
  { name: "Travel Adapter", description: "A small constant across unfamiliar outlets.", image: "/travel/5.jpg" },
  { name: "Travel Bottles", description: "Simple essentials for lighter packing.", image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=700&q=82" },
  { name: "Power Bank", description: "Backup power when the journey runs long.", image: "/travel/4.jpg" },
  { name: "Neck Pillow", description: "Comfort for long-distance travel.", image: "/travel/1.jpg" },
  { name: "Rain Jacket", description: "Light protection when weather changes.", image: "/travel/2.jpg" },
];
const loopStartIndex = essentials.length;
const loopEndIndex = essentials.length * 2;
const carouselItems = [...essentials, ...essentials, ...essentials];
const reveal: Variants = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: "easeOut" } } };
export function TravelEssentialsSection() {
  const [activeIndex, setActiveIndex] = useState(loopStartIndex);
  const [itemStep, setItemStep] = useState(304);
  const [isPaused, setIsPaused] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const manualTimerRef = useRef<number | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const measureTrack = () => {
      const firstCard = trackRef.current?.querySelector<HTMLElement>("[data-essential-card]");
      if (!firstCard || !trackRef.current) return;
      const styles = window.getComputedStyle(trackRef.current);
      const gap = Number.parseFloat(styles.columnGap || styles.gap || "0") || 0;
      setItemStep(firstCard.offsetWidth + gap);
    };

    measureTrack();
    window.addEventListener("resize", measureTrack);
    return () => window.removeEventListener("resize", measureTrack);
  }, []);

  const move = useCallback((direction: number) => {
    setIsMoving(true);
    setActiveIndex((current) => current + direction);

    if (manualTimerRef.current) {
      window.clearTimeout(manualTimerRef.current);
    }

    manualTimerRef.current = window.setTimeout(() => {
      setIsMoving(false);
      setActiveIndex((current) => {
        if (current >= loopEndIndex) return loopStartIndex;
        if (current < loopStartIndex) return loopEndIndex - 1;
        return current;
      });
    }, 720);
  }, []);

  useEffect(() => {
    if (isPaused) return;

    const timer = window.setInterval(() => {
      move(1);
    }, 3400);

    return () => window.clearInterval(timer);
  }, [isPaused, move]);

  useEffect(() => {
    return () => {
      if (manualTimerRef.current) {
        window.clearTimeout(manualTimerRef.current);
      }
    };
  }, []);

  return (
    <section className="scroll-mt-28 overflow-hidden bg-[#050505] px-8 pb-24 pt-8 text-[#f8f4ea] sm:px-12 lg:px-16 lg:pb-32" id="covoyage-essentials">
      <motion.div className="mx-auto max-w-7xl" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.18 }}>
        <motion.div className="flex items-center gap-8" variants={reveal}>
          <h2 className="shrink-0 text-xl font-semibold uppercase tracking-[0.18em] sm:text-3xl sm:tracking-[0.22em] lg:text-4xl">CoVoyage Essentials</h2>
          <div className="h-px flex-1 bg-white/28" />
        </motion.div>

        <motion.p className="mt-6 max-w-xl font-serif text-3xl leading-tight text-white sm:text-4xl lg:text-[2.65rem]" variants={reveal}>
          Everything you might wish you packed.
        </motion.p>

        <motion.div className="relative mt-14 overflow-hidden py-10" onBlur={() => setIsPaused(false)} onFocus={() => setIsPaused(true)} onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)} variants={reveal}>
          <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-20 bg-gradient-to-r from-[#050505] to-transparent sm:w-32" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-20 bg-gradient-to-l from-[#050505] to-transparent sm:w-32" />

          <button aria-label="Previous essential" className="absolute left-0 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-white/18 bg-black/50 text-white/72 backdrop-blur-xl transition duration-300 hover:border-white/34 hover:text-white" onClick={() => move(-1)} type="button">
            <ChevronLeft className="h-5 w-5" strokeWidth={1.6} />
          </button>
          <button aria-label="Next essential" className="absolute right-0 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-white/18 bg-black/50 text-white/72 backdrop-blur-xl transition duration-300 hover:border-white/34 hover:text-white" onClick={() => move(1)} type="button">
            <ChevronRight className="h-5 w-5" strokeWidth={1.6} />
          </button>

          <div ref={trackRef} className={`flex gap-5 will-change-transform sm:gap-6 ${isMoving ? "transition-transform duration-700 ease-out" : ""}`} style={{ transform: `translate3d(-${activeIndex * itemStep}px, 0, 0)` }}>
            {carouselItems.map((item, index) => (
              <article className="group/card relative h-[22rem] w-[14rem] shrink-0 overflow-hidden border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/25 transition-transform duration-500 hover:scale-[1.05] hover:border-white/28 sm:h-[26rem] sm:w-[16rem] lg:h-[29rem] lg:w-[17rem]" data-essential-card key={`${item.name}-${index}`}>
                <Image alt={item.name} className="object-cover grayscale-[14%] transition duration-700 group-hover/card:scale-105" fill sizes="(min-width: 1024px) 272px, (min-width: 640px) 256px, 224px" src={item.image} />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.04)_0%,rgba(5,5,5,0.28)_52%,rgba(5,5,5,0.92)_100%)]" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-center">
                  <h3 className="font-serif text-2xl leading-tight text-white">{item.name}</h3>
                  <p className="mx-auto mt-3 max-w-[14rem] text-sm leading-6 text-white/66">{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </motion.div>

        <div className="relative z-40 mt-10 flex justify-center">
          <Link className="group inline-flex items-center gap-4 border border-[#f8f4ea]/70 bg-[#f8f4ea] px-8 py-4 text-sm font-semibold text-[#050505] shadow-2xl shadow-black/30 transition duration-300 hover:border-white hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]" href="/essentials">
            <span>Explore Essentials</span>
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
