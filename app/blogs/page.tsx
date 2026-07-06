import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { ContentCard } from "@/components/shared/ContentCard";
import { PageShell } from "@/components/shared/PageShell";
import { Button } from "@/components/ui/button";

const posts = [
  {
    title: "Three Days of Slow Mornings in Kyoto",
    author: "Nora Ellis",
    date: "June 12, 2026",
    description:
      "A gentle itinerary through temple lanes, quiet tea houses, and neighborhood walks.",
    palette: "from-[#d4ddd1] via-[#a9b9a2] to-[#6f806d]",
  },
  {
    title: "Finding Dinner Companions in Lisbon",
    author: "Mateo Silva",
    date: "May 28, 2026",
    description:
      "How shared tables, local markets, and patient wandering shaped a solo-not-solo trip.",
    palette: "from-[#ead9bd] via-[#c8aa80] to-[#8f765c]",
  },
  {
    title: "A Field Guide to Mountain Train Days",
    author: "Leah Stone",
    date: "May 03, 2026",
    description:
      "Packing notes, window-seat rituals, and scenic route ideas for alpine journeys.",
    palette: "from-[#ead5cf] via-[#c7a59a] to-[#75635f]",
  },
];

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function BlogsPage() {
  return (
    <PageShell
      description="Placeholder travel stories and guides from the CoVoyage community."
      eyebrow="CoVoyage journal"
      title="Stories From Shared Roads"
    >
      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {posts.map((post) => {
            const slug = slugify(post.title);

            return (
            <ContentCard className="overflow-hidden p-0 scroll-mt-28" id={slug} key={post.title}>
              <div className={`h-56 bg-gradient-to-br ${post.palette}`}>
                <div className="h-full bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.45),transparent_20%),repeating-linear-gradient(135deg,rgba(255,255,255,0.22)_0_1px,transparent_1px_18px)]" />
              </div>
              <div className="p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
                  {post.author} / {post.date}
                </p>
                <h2 className="mt-4 font-serif text-3xl leading-tight text-stone-900">
                  {post.title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-stone-600">
                  {post.description}
                </p>
                <Button asChild className="mt-6" variant="outline">
                  <Link href={`/blogs#${slug}`}>
                    Read More
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </ContentCard>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}
