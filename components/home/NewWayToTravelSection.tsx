"use client";

import { BookOpen, Compass, ShoppingBag, UsersRound, type LucideIcon } from "lucide-react";
import { motion, type Variants } from "framer-motion";

const reveal: Variants = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: "easeOut" } } };

type TreeItem = { title: string; description: string; href: string; Icon: LucideIcon; side: "left" | "right" };

const items: TreeItem[] = [
  { title: "FIND YOUR TRIBE", description: "Connect with like-minded global explorers.", href: "#find-your-tribe", Icon: UsersRound, side: "left" },
  { title: "MASTER THE LOCAL VIBE", description: "Unlock insider tips and culture.", href: "#master-local-vibe", Icon: Compass, side: "right" },
  { title: "COVOYAGE JOURNALS", description: "Real stories from real journeys.", href: "#covoyage-journals", Icon: BookOpen, side: "left" },
  { title: "COVOYAGE ESSENTIALS", description: "Essential gear for last-minute journeys.", href: "#covoyage-essentials", Icon: ShoppingBag, side: "right" },
];

export function NewWayToTravelSection() {
  return (
    <section className="scroll-mt-28 px-8 pb-24 pt-6 text-[#f8f4ea] sm:px-12 lg:px-16" id="new-way-to-travel">
      <motion.div className="mx-auto max-w-7xl" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
        <motion.div className="flex items-center gap-8" variants={reveal}>
          <div className="h-px flex-1 bg-white/28" />
          <h2 className="shrink-0 text-center text-xl font-semibold uppercase tracking-[0.18em] sm:text-3xl sm:tracking-[0.22em] lg:text-4xl">THE NEW WAY TO TRAVEL</h2>
          <div className="h-px flex-1 bg-white/28" />
        </motion.div>
        <div className="mt-16 grid gap-12 lg:grid-cols-[0.56fr_0.44fr] lg:items-center lg:gap-16">
          <motion.div className="max-w-3xl text-lg leading-9 text-white/70 sm:text-xl sm:leading-10" variants={reveal}>
            <p>Travel isn’t just where one goes—it is defined by who shares the journey. Beyond fragmented apps and static plans, CoVoyage brings people, culture, and adaptive AI into one living ecosystem so no traveler walks alone. Every feature is intentionally designed to foster authentic human connection and transform foreign spaces into shared memories.</p>
            <p className="mt-14">Like branches from a shared root, our features seamlessly connect every step of your voyage. Explore the tree to see how traveler matching, live itinerary refinement, and local intelligence shape your next story. Each leaf represents a unique gateway to experiencing the world with greater depth, clarity, and camaraderie.</p>
          </motion.div>
          <motion.div className="relative mx-auto h-[34rem] w-full max-w-xl" variants={reveal}>
            <div className="absolute left-1/2 top-8 h-[28rem] w-px -translate-x-1/2 bg-white/30" />
            {items.map((item, index) => {
              const top = `${8 + index * 8.7}rem`;
              const leftSide = item.side === "left";
              return (
                <a className={`group absolute flex w-[15rem] items-start gap-4 transition duration-300 hover:scale-105 ${leftSide ? "right-[52%] flex-row-reverse text-right" : "left-[52%]"}`} href={item.href} key={item.title} style={{ top }}>
                  <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/24 bg-black text-white transition duration-300 group-hover:bg-white group-hover:text-black"><item.Icon className="h-4 w-4" strokeWidth={1.5} /></span>
                  <span>
                    <span className="block text-sm font-semibold uppercase tracking-[0.28em] text-white">{item.title}</span>
                    <span className="mt-3 block text-sm leading-6 text-white/56">{item.description}</span>
                  </span>
                  <span className="absolute top-3 h-3 w-3 rounded-full bg-white shadow-[0_0_0_8px_rgba(255,255,255,0.12)]" style={{ [leftSide ? "right" : "left"]: "calc(-2% - 0.375rem)" }} />
                </a>
              );
            })}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
