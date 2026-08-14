"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowRight, Film, Images, PenLine, Play, Quote } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { landingJournalPosts, type JournalPost } from "@/lib/journalData";

const reveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: "easeOut" },
  },
};
const stagger: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: 0.18, staggerChildren: 0.14 } },
};
const storyReveal: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.72, ease: "easeOut" },
  },
};

const [featuredPost, photoPost, textPost] = landingJournalPosts;
const petraFeaturedPost = {
  ...featuredPost,
  title: "A Journey Through Petra",
  destination: "JORDAN / PETRA",
  readingTime: "4 MIN WATCH",
};
const petraPhotoPost = {
  ...photoPost,
  title: "A Quiet Morning in Petra",
  destination: "JORDAN / PETRA",
  image:
    "https://images.unsplash.com/photo-1574681332110-c45ff35a5e09?auto=format&fit=crop&w=1200&q=88",
  imageAlt: "Petra Treasury in Jordan framed by sandstone cliffs",
};

function ViewJournalCue() {
  return (
    <span className="absolute bottom-5 left-5 flex translate-y-2 items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/0 transition duration-300 group-hover:translate-y-0 group-hover:text-white/82">
      View Journal
      <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
    </span>
  );
}

function JournalCardLink({
  children,
  className,
  post,
}: {
  children: ReactNode;
  className: string;
  post: JournalPost;
}) {
  return (
    <motion.article variants={storyReveal}>
      <Link className={className} href={`/journal#${post.slug}`}>
        {children}
      </Link>
    </motion.article>
  );
}

export function CovoyageJournalsSection() {
  return (
    <section
      className="scroll-mt-28 bg-[#050505] px-8 pb-24 pt-8 text-[#f8f4ea] sm:px-12 lg:px-16 lg:pb-32"
      id="covoyage-journals"
    >
      <motion.div
        className="mx-auto max-w-7xl"
        initial="hidden"
        viewport={{ once: true, amount: 0.18 }}
        whileInView="visible"
      >
        <motion.div className="flex items-center justify-end gap-8" variants={reveal}>
          <div className="h-px flex-1 bg-white/28" />
          <h2 className="shrink-0 text-right text-xl font-semibold uppercase tracking-[0.18em] sm:text-3xl sm:tracking-[0.22em] lg:text-4xl">
            CoVoyage Journals
          </h2>
        </motion.div>
        <div className="mt-10 grid gap-10 lg:grid-cols-[0.34fr_0.66fr] lg:gap-14">
          <motion.div className="max-w-md" variants={reveal}>
            <p className="font-serif text-3xl leading-tight text-white sm:text-4xl lg:text-[2.8rem]">
              Every journey has a story. Tell yours.
            </p>
            <p className="mt-7 text-base leading-8 text-white/62">
              Share the places you discover, the people you meet, and the
              moments that made the journey yours.
            </p>
            <div className="mt-8 border-y border-white/10 py-5">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-white/38">
                Journal Formats
              </p>
              <p className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white/54">
                <span>Video</span>
                <span>Photo</span>
                <span>Text</span>
              </p>
              <p className="mt-3 text-sm leading-6 text-white/42">
                Every journey can be remembered differently.
              </p>
            </div>
            <div className="mt-12 flex flex-col gap-4 sm:flex-row lg:flex-col xl:flex-row">
              <Link
                className="group inline-flex items-center justify-center gap-5 border border-white/18 bg-white/10 px-7 py-4 text-sm font-semibold text-white backdrop-blur-2xl transition duration-300 hover:border-white/32 hover:bg-white/18"
                href="/journal"
              >
                <span>Explore Journals</span>
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                className="group inline-flex items-center justify-center gap-4 px-2 py-4 text-sm font-semibold text-white/68 transition duration-300 hover:text-white"
                href="/journal#create-post"
              >
                <span>Share your journey</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
          <motion.div
            className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]"
            variants={stagger}
          >
            <JournalCardLink
              className="group relative block min-h-[32rem] overflow-hidden border border-white/10 bg-black outline-none"
              post={petraFeaturedPost}
            >
              <video
                aria-label="Petra video journal"
                autoPlay
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                loop
                muted
                playsInline
                src="/videos/petra-journal.mp4"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.08)_0%,rgba(5,5,5,0.42)_54%,rgba(5,5,5,0.86)_100%)]" />
              <div className="absolute left-6 top-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
                <Film className="h-4 w-4" strokeWidth={1.5} />
                Featured Video Journal
              </div>
              <div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/34 bg-black/38 text-white backdrop-blur-xl">
                <Play className="ml-1 h-6 w-6 fill-current" strokeWidth={1.5} />
              </div>
              <div className="absolute bottom-16 left-6 right-6 transition duration-300 group-hover:-translate-y-1">
                <p className="text-xs uppercase tracking-[0.26em] text-white/54">
                  {petraFeaturedPost.destination} / {petraFeaturedPost.readingTime}
                </p>
                <h3 className="mt-3 font-serif text-4xl leading-tight text-white sm:text-5xl">
                  {petraFeaturedPost.title}
                </h3>
              </div>
              <ViewJournalCue />
            </JournalCardLink>
            <div className="grid gap-5">
              <JournalCardLink
                className="group relative block min-h-[16rem] overflow-hidden border border-white/10 bg-black outline-none"
                post={petraPhotoPost}
              >
                <Image
                  alt={petraPhotoPost.imageAlt}
                  className="object-cover transition duration-700 group-hover:scale-105"
                  fill
                  sizes="(min-width: 1024px) 24vw, 100vw"
                  src={petraPhotoPost.image}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.12)_0%,rgba(5,5,5,0.82)_100%)]" />
                <div className="absolute left-5 top-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/66">
                  <Images className="h-4 w-4" strokeWidth={1.5} />
                  {photoPost.type}
                </div>
                <div className="absolute bottom-14 left-5 right-5 transition duration-300 group-hover:-translate-y-1">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/48">
                    {petraPhotoPost.destination}
                  </p>
                  <h3 className="mt-2 font-serif text-2xl leading-tight text-white">
                    {petraPhotoPost.title}
                  </h3>
                </div>
                <ViewJournalCue />
              </JournalCardLink>
              <JournalCardLink
                className="group relative block min-h-[16rem] overflow-hidden border border-white/10 bg-white/[0.035] p-6 outline-none transition duration-300 hover:bg-white/[0.055]"
                post={textPost}
              >
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/48">
                  <PenLine className="h-4 w-4" strokeWidth={1.5} />
                  {textPost.type}
                </div>
                <Quote className="mt-8 h-7 w-7 text-white/26" strokeWidth={1.2} />
                <p className="mt-5 font-serif text-2xl leading-snug text-white transition duration-300 group-hover:-translate-y-1">
                  Sometimes the best part of travelling is getting lost...&rdquo;
                </p>
                <ViewJournalCue />
              </JournalCardLink>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
