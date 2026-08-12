import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

import { journalPosts } from "./journalData";

export const metadata = {
  title: "Blogs | CoVoyage Journal",
  description:
    "Browse immersive vertical travel stories from the CoVoyage Journal.",
};

export default function JournalBlogsPage() {
  return (
    <div className="min-h-screen bg-[#fbf8f2] text-stone-900">
      <Navbar />
      <main className="relative">
        <div className="sticky top-20 z-30 border-b border-stone-200/80 bg-[#fbf8f2]/88 px-5 py-3 backdrop-blur sm:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <Link
              className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-stone-600 transition-colors hover:text-stone-950"
              href="/journal"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Journal
            </Link>
            <p className="hidden text-xs uppercase tracking-[0.24em] text-stone-500 sm:block">
              Vertical Journal Feed
            </p>
          </div>
        </div>

        <section
          aria-label="CoVoyage Journal stories"
          className="h-[calc(100vh-5rem)] snap-y snap-mandatory overflow-y-auto scroll-smooth"
        >
          {journalPosts.map((post, index) => (
            <article
              className="relative flex min-h-[calc(100vh-5rem)] snap-start items-end overflow-hidden px-5 py-8 sm:px-8 lg:py-12"
              id={`story-${index + 1}`}
              key={post.slug}
            >
              <Image
                alt={post.imageAlt}
                className="absolute inset-0 h-full w-full object-cover"
                fill
                priority={index === 0}
                sizes="100vw"
                src={post.image}
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(28,25,23,0.08),rgba(28,25,23,0.24)_42%,rgba(28,25,23,0.78)),linear-gradient(90deg,rgba(28,25,23,0.62),rgba(28,25,23,0.18)_58%,rgba(28,25,23,0.34))]" />
              <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_4rem] lg:items-end">
                <div className="max-w-3xl text-white">
                  <p className="text-xs font-medium uppercase tracking-[0.34em] text-white/78">
                    {post.category}
                  </p>
                  <h1 className="mt-4 font-serif text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">
                    {post.title}
                  </h1>
                  <p className="mt-5 max-w-2xl text-sm leading-7 text-white/84 sm:text-base sm:leading-8">
                    {post.excerpt}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-xs uppercase tracking-[0.18em] text-white/76">
                    <span>{post.destination}</span>
                    <span>{post.author}</span>
                    <span>{post.readingTime}</span>
                  </div>
                  <Link
                    className="mt-7 inline-flex items-center gap-2 border border-white/55 px-5 py-3 text-xs font-medium uppercase tracking-[0.2em] text-white transition-colors hover:bg-white hover:text-stone-950"
                    href={`/journal/blogs/${post.slug}`}
                  >
                    Read Story
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <ol className="hidden justify-self-end space-y-3 lg:block">
                  {journalPosts.map((indicatorPost, indicatorIndex) => (
                    <li key={indicatorPost.slug}>
                      <a
                        aria-label={`Go to story ${indicatorIndex + 1}`}
                        className={
                          indicatorIndex === index
                            ? "block h-3 w-3 rounded-full border border-white bg-white"
                            : "block h-3 w-3 rounded-full border border-white/70"
                        }
                        href={`#story-${indicatorIndex + 1}`}
                      />
                    </li>
                  ))}
                </ol>
              </div>
            </article>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}
