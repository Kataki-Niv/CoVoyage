"use client";

import {
  ArrowRight,
  BookOpen,
  Camera,
  Check,
  Film,
  Lightbulb,
  PenLine,
  Plus,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  communityJournalPosts,
  featuredJournalPost,
  insightJournalPosts,
  journalPosts,
  type JournalPost,
} from "@/lib/journalData";

const filters = ["All", "Stories", "Guides", "Photos", "Videos", "Tips"] as const;
type ActiveFilter = (typeof filters)[number];

const typeIcons = {
  "Video Journal": Film,
  "Photo Journal": Camera,
  "Text Journal": PenLine,
  "Travel Guide": BookOpen,
  "Travel Tip": Lightbulb,
  "Community Story": Sparkles,
};

export function JournalPageClient() {
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("All");
  const [isModalOpen, setIsModalOpen] = useState(
    () => typeof window !== "undefined" && window.location.hash === "#create-post",
  );
  const [showConfirmation, setShowConfirmation] = useState(false);

  const filteredPosts = useMemo(() => {
    if (activeFilter === "All") {
      return journalPosts;
    }

    return journalPosts.filter((post) => post.filter === activeFilter);
  }, [activeFilter]);

  const openModal = () => {
    setShowConfirmation(false);
    setIsModalOpen(true);
  };

  return (
    <>
      <main className="bg-[#050505] text-[#f8f4ea]">
        <Hero />
        <FeaturedJournal post={featuredJournalPost} />
        <section className="border-y border-white/10 bg-[#101010] px-5 py-4 sm:px-8">
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto">
            {filters.map((filter) => (
              <button
                className={
                  activeFilter === filter
                    ? "h-10 shrink-0 rounded-full bg-[#f8f4ea] px-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#050505]"
                    : "h-10 shrink-0 rounded-full border border-white/14 px-5 text-xs font-semibold uppercase tracking-[0.18em] text-white/58 transition-colors hover:border-white/40 hover:text-white"
                }
                key={filter}
                onClick={() => setActiveFilter(filter)}
                type="button"
              >
                {filter}
              </button>
            ))}
          </div>
        </section>
        <TravelerGallery posts={filteredPosts} />
        <CommunitySection />
        <InsightsSection />
        <ShareJourneySection onCreate={openModal} />
      </main>
      {isModalOpen ? (
        <CreatePostModal
          onClose={() => setIsModalOpen(false)}
          onPublish={() => setShowConfirmation(true)}
          showConfirmation={showConfirmation}
        />
      ) : null}
    </>
  );
}

function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-5rem)] overflow-hidden px-5 py-16 sm:px-8 lg:py-20">
      <Image
        alt="Travel journal view over a mountain valley"
        className="absolute inset-0 h-full w-full object-cover"
        fill
        priority
        sizes="100vw"
        src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2200&q=88"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(28,25,23,0.78),rgba(28,25,23,0.38)_56%,rgba(28,25,23,0.16)),linear-gradient(180deg,rgba(28,25,23,0.16),rgba(28,25,23,0.64))]" />
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-13rem)] max-w-7xl items-end">
        <div className="max-w-3xl pb-10 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/70">
            CoVoyage Journal
          </p>
          <h1 className="mt-5 font-serif text-6xl leading-[0.95] sm:text-7xl lg:text-8xl">
            Stories from the Road
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-8 text-white/82 sm:text-lg">
            Share the places you discover, the people you meet, and the moments
            that made the journey yours.
          </p>
        </div>
      </div>
    </section>
  );
}

function FeaturedJournal({ post }: { post: JournalPost }) {
  return (
    <section className="px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.38fr_0.62fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/46">
              Featured Journal
            </p>
            <h2 className="mt-4 font-serif text-5xl leading-tight text-[#f8f4ea]">
              {post.title}
            </h2>
            <p className="mt-5 text-base leading-8 text-white/64">
              {post.excerpt}
            </p>
            <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-xs uppercase tracking-[0.18em] text-white/46">
              <span>{post.type}</span>
              <span>{post.destination}</span>
              <span>{post.readingTime}</span>
            </div>
          </div>
          <Link
            className="group relative min-h-[360px] overflow-hidden bg-[#151515] sm:min-h-[520px]"
            href={`#${post.slug}`}
          >
            <Image
              alt={post.imageAlt}
              className="object-cover transition duration-700 group-hover:scale-105"
              fill
              sizes="(min-width: 1024px) 62vw, calc(100vw - 40px)"
              src={post.image}
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(28,25,23,0.06),rgba(28,25,23,0.62))]" />
            <div className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/55 bg-black/38 text-white backdrop-blur-xl">
              <Film className="h-8 w-8" strokeWidth={1.4} />
            </div>
            <span className="absolute bottom-6 left-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-white">
              View Journal
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function TravelerGallery({ posts }: { posts: JournalPost[] }) {
  return (
    <section className="px-5 pb-16 sm:px-8 lg:pb-24" id="gallery">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/46">
              Traveler&apos;s Gallery
            </p>
            <h2 className="mt-3 font-serif text-5xl text-[#f8f4ea]">
              Field notes, films, photos, and guides
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-white/60">
            A mixed community feed for the stories travelers actually bring
            home.
          </p>
        </div>
        <div className="grid auto-rows-[minmax(280px,auto)] gap-5 lg:grid-cols-12">
          {posts.map((post, index) => (
            <JournalCard key={post.slug} post={post} variant={index % 5} />
          ))}
        </div>
      </div>
    </section>
  );
}

function JournalCard({ post, variant }: { post: JournalPost; variant: number }) {
  const Icon = typeIcons[post.type];
  const wide = variant === 0 || variant === 3;

  return (
    <article
      className={
        wide
          ? "group relative scroll-mt-28 overflow-hidden border border-white/10 bg-[#151515] lg:col-span-7"
          : "group relative scroll-mt-28 overflow-hidden border border-white/10 bg-[#151515] lg:col-span-5"
      }
      id={post.slug}
    >
      <Image
        alt={post.imageAlt}
        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
        fill
        sizes={wide ? "(min-width: 1024px) 58vw, 100vw" : "(min-width: 1024px) 42vw, 100vw"}
        src={post.image}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(28,25,23,0.12),rgba(28,25,23,0.78)),linear-gradient(90deg,rgba(28,25,23,0.64),rgba(28,25,23,0.18))]" />
      <div className="relative z-10 flex min-h-[360px] flex-col justify-between p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-white/76">
          <span className="inline-flex items-center gap-2">
            <Icon className="h-4 w-4" strokeWidth={1.5} />
            {post.type}
          </span>
          <span>{post.destination}</span>
        </div>
        <div className="max-w-xl">
          <h3 className="font-serif text-4xl leading-tight sm:text-5xl">
            {post.title}
          </h3>
          <p className="mt-4 text-sm leading-7 text-white/78">{post.excerpt}</p>
          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs uppercase tracking-[0.18em] text-white/62">
            <span>{post.author}</span>
            <span>{post.readingTime}</span>
          </div>
          <a
            className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
            href={`#${post.slug}`}
          >
            View Journal
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </article>
  );
}

function CommunitySection() {
  return (
    <section className="bg-[#101010] px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/46">
          From Travelers, For Travelers
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {communityJournalPosts.map((post) => (
            <a
              className="group block border border-white/10 bg-[#171717] p-6 transition-colors hover:bg-[#1f1f1f]"
              href={`#${post.slug}`}
              key={post.slug}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/46">
                {post.destination}
              </p>
              <h3 className="mt-4 font-serif text-3xl leading-tight text-[#f8f4ea]">
                {post.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-white/60">
                {post.excerpt}
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/58 group-hover:text-white">
                Read note
                <ArrowRight className="h-4 w-4" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function InsightsSection() {
  return (
    <section className="px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.32fr_0.68fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/46">
            CoVoyage Insights
          </p>
          <h2 className="mt-3 font-serif text-4xl text-[#f8f4ea]">
            Quick notes for better travel days
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {insightJournalPosts.map((post) => (
            <a className="group border-b border-white/10 pb-5" href={`#${post.slug}`} key={post.slug}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/46">
                {post.destination} / {post.readingTime}
              </p>
              <h3 className="mt-3 font-serif text-2xl leading-tight text-[#f8f4ea]">
                {post.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/60">
                {post.excerpt}
              </p>
            </a>
          ))}
          {["Navigating Visa Requirements", "Local Etiquette Tips"].map((title) => (
            <div className="border-b border-white/10 pb-5" key={title}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/46">
                Planning note / 3 min read
              </p>
              <h3 className="mt-3 font-serif text-2xl leading-tight text-[#f8f4ea]">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/60">
                A lightweight editorial tip from the CoVoyage desk for smoother
                preparation.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ShareJourneySection({ onCreate }: { onCreate: () => void }) {
  return (
    <section className="bg-[#050505] px-5 py-16 text-white sm:px-8 lg:py-24" id="create-post">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/50">
            Share Your Journey
          </p>
          <h2 className="mt-4 font-serif text-5xl leading-tight">
            Have a story to tell?
          </h2>
          <p className="mt-5 text-base leading-8 text-white/68">
            Share a story, photo, video, guide, or travel tip with the CoVoyage
            community. This prototype captures the flow without publishing yet.
          </p>
        </div>
        <button
          className="inline-flex h-12 w-fit items-center gap-3 rounded-full bg-[#f8f4ea] px-6 text-sm font-semibold text-[#050505] transition-colors hover:bg-white"
          onClick={onCreate}
          type="button"
        >
          <Plus className="h-4 w-4" />
          Create a Post
        </button>
      </div>
    </section>
  );
}

function CreatePostModal({
  onClose,
  onPublish,
  showConfirmation,
}: {
  onClose: () => void;
  onPublish: () => void;
  showConfirmation: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto bg-[#121212] p-6 text-[#f8f4ea] shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/46">
              Prototype
            </p>
            <h2 className="mt-2 font-serif text-4xl text-[#f8f4ea]">
              Create a Post
            </h2>
          </div>
          <button
            aria-label="Close create post modal"
            className="grid h-10 w-10 place-items-center rounded-full border border-white/14 text-white/60 hover:text-white"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form className="mt-7 space-y-5" onSubmit={(event) => event.preventDefault()}>
          <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
            Post type
            <select className="mt-2 h-12 w-full border border-white/14 bg-[#1b1b1b] px-4 text-sm normal-case tracking-normal text-[#f8f4ea]">
              <option>Story</option>
              <option>Photo Journal</option>
              <option>Video Journal</option>
              <option>Travel Guide</option>
              <option>Travel Tip</option>
            </select>
          </label>
          <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
            Title
            <input className="mt-2 h-12 w-full border border-white/14 bg-[#1b1b1b] px-4 text-sm normal-case tracking-normal text-[#f8f4ea]" />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
            Destination
            <input className="mt-2 h-12 w-full border border-white/14 bg-[#1b1b1b] px-4 text-sm normal-case tracking-normal text-[#f8f4ea]" />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
            Content
            <textarea className="mt-2 min-h-32 w-full border border-white/14 bg-[#1b1b1b] p-4 text-sm normal-case tracking-normal text-[#f8f4ea]" />
          </label>
          <div className="border border-dashed border-white/14 bg-[#1b1b1b] p-6 text-center text-sm text-white/50">
            Image/video upload area
          </div>
          {showConfirmation ? (
            <div className="flex items-center gap-2 bg-white/10 px-4 py-3 text-sm text-white/70">
              <Check className="h-4 w-4" />
              Coming soon. This prototype did not publish or call the backend.
            </div>
          ) : null}
          <button
            className="inline-flex h-12 items-center gap-3 rounded-full bg-[#f8f4ea] px-6 text-sm font-semibold text-[#050505] hover:bg-white"
            onClick={onPublish}
            type="button"
          >
            <Send className="h-4 w-4" />
            Publish
          </button>
        </form>
      </div>
    </div>
  );
}
