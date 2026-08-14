import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { HistoryBackButton } from "@/components/shared/HistoryBackButton";

import { getJournalPost, journalPosts } from "../journalData";

type JournalArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return journalPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: JournalArticlePageProps) {
  const { slug } = await params;
  const post = getJournalPost(slug);

  if (!post) {
    return {
      title: "Journal Story | CoVoyage",
    };
  }

  return {
    title: `${post.title} | CoVoyage Journal`,
    description: post.excerpt,
  };
}

export default async function JournalArticlePage({
  params,
}: JournalArticlePageProps) {
  const { slug } = await params;
  const post = getJournalPost(slug);

  if (!post) {
    notFound();
  }

  const morePosts = journalPosts
    .filter((candidate) => candidate.slug !== post.slug)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#fbf8f2] text-stone-900">
      <Navbar />
      <main>
        <article>
          <header className="px-5 pb-10 pt-10 sm:px-8 lg:pb-14">
            <div className="mx-auto max-w-7xl">
              <HistoryBackButton
                className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-stone-600 transition-colors hover:text-stone-950"
              >
                Back to Journal
              </HistoryBackButton>
              <div className="mt-8 grid gap-9 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:items-end">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.34em] text-stone-500">
                    {post.type}
                  </p>
                  <h1 className="mt-4 font-serif text-5xl leading-tight text-stone-950 sm:text-6xl">
                    {post.title}
                  </h1>
                  <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-xs uppercase tracking-[0.18em] text-stone-500">
                    <span>{post.destination}</span>
                    <span>{post.author}</span>
                    <span>{post.readingTime}</span>
                  </div>
                </div>
                <p className="max-w-2xl text-base leading-8 text-stone-600 lg:justify-self-end">
                  {post.excerpt}
                </p>
              </div>
              <figure className="relative mt-10 min-h-[420px] overflow-hidden border border-stone-200 bg-stone-200 sm:min-h-[560px]">
                <Image
                  alt={post.imageAlt}
                  className="absolute inset-0 h-full w-full object-cover"
                  fill
                  priority
                  sizes="(min-width: 1280px) 1216px, calc(100vw - 40px)"
                  src={post.image}
                />
              </figure>
            </div>
          </header>

          <div className="mx-auto max-w-3xl px-5 pb-8 sm:px-8">
            {post.body.map((paragraph) => (
              <p
                className="mt-6 text-base leading-8 text-stone-700 first:mt-0"
                key={paragraph}
              >
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mx-auto max-w-7xl space-y-14 px-5 py-14 sm:px-8 lg:py-20">
            {post.sections.map((section, index) => (
              <section
                className="grid gap-8 border-t border-stone-200 pt-10 lg:grid-cols-2 lg:items-center"
                key={section.heading}
              >
                <figure
                  className={
                    index % 2 === 0
                      ? "relative min-h-[320px] overflow-hidden border border-stone-200 bg-stone-200"
                      : "relative min-h-[320px] overflow-hidden border border-stone-200 bg-stone-200 lg:order-2"
                  }
                >
                  <Image
                    alt={section.imageAlt}
                    className="absolute inset-0 h-full w-full object-cover"
                    fill
                    sizes="(min-width: 1024px) 50vw, calc(100vw - 40px)"
                    src={section.image}
                  />
                </figure>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.3em] text-stone-500">
                    Field Note
                  </p>
                  <h2 className="mt-3 font-serif text-4xl leading-tight text-stone-950">
                    {section.heading}
                  </h2>
                  <p className="mt-5 text-base leading-8 text-stone-600">
                    {section.content}
                  </p>
                </div>
              </section>
            ))}
          </div>
        </article>

        <section className="border-t border-stone-200 bg-[#f4eee4] px-5 py-14 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.34em] text-stone-500">
                  More from CoVoyage Journal
                </p>
                <h2 className="mt-3 font-serif text-4xl text-stone-950">
                  Keep reading
                </h2>
              </div>
              <Link
                className="inline-flex w-fit items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-stone-600 hover:text-stone-950"
                href="/journal"
              >
                View Feed
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {morePosts.map((morePost) => (
                <Link
                  className="group border border-stone-200 bg-[#fbf8f2] p-5 transition-colors hover:bg-white"
                  href={`/journal/blogs/${morePost.slug}`}
                  key={morePost.slug}
                >
                  <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-stone-500">
                    {morePost.type}
                  </p>
                  <h3 className="mt-3 font-serif text-2xl leading-tight text-stone-950 group-hover:text-stone-700">
                    {morePost.title}
                  </h3>
                  <p className="mt-4 text-xs uppercase tracking-[0.18em] text-stone-500">
                    {morePost.destination} / {morePost.readingTime}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
