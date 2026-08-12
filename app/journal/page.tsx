import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { ContentCard } from "@/components/shared/ContentCard";
import { PageShell } from "@/components/shared/PageShell";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Journal | CoVoyage",
  description:
    "Travel stories, city guides, and slow routes from the CoVoyage Journal.",
};

export default function JournalPage() {
  return (
    <PageShell
      description="Travel stories, city guides, slow routes, and practical notes from the CoVoyage editorial desk."
      eyebrow="CoVoyage journal"
      title="Stories From Shared Roads"
    >
      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <ContentCard className="overflow-hidden p-0">
          <div className="grid min-h-[420px] lg:grid-cols-[0.56fr_0.44fr]">
            <div className="relative bg-gradient-to-br from-[#ead5cf] via-[#c7a59a] to-[#75635f]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.45),transparent_20%),repeating-linear-gradient(135deg,rgba(255,255,255,0.22)_0_1px,transparent_1px_18px)]" />
              <p className="absolute bottom-8 right-8 max-w-52 text-right font-serif text-5xl leading-tight text-white/80">
                CoVoyage Journal
              </p>
            </div>
            <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500">
                Editorial Dispatches
              </p>
              <h2 className="mt-4 font-serif text-4xl leading-tight text-stone-900 sm:text-5xl">
                Immersive travel stories, one journey at a time.
              </h2>
              <p className="mt-5 text-sm leading-7 text-stone-600">
                Browse demo stories from Iceland, Japan, Norway, Guatemala, and
                Spain in a vertical editorial feed built for slower discovery.
              </p>
              <Button asChild className="mt-8 w-fit" size="lg">
                <Link href="/journal/blogs">
                  Read Blogs
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </ContentCard>
      </section>
    </PageShell>
  );
}
