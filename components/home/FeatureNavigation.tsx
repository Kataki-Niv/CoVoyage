import Link from "next/link";

import { DecorativeElement } from "@/components/home/DecorativeElements";

const chapters = [
  { number: "01", label: "Find Your Tribe", href: "#tribe" },
  { number: "02", label: "Explore Local Vibe", href: "#vibe" },
  { number: "03", label: "CoVoyage Journal", href: "#journal" },
];

export function FeatureNavigation() {
  return (
    <section id="community" className="relative border-y border-stone-200 bg-white">
      <DecorativeElement className="left-6 top-3 h-16 w-28" variant="route" />
      <div className="mx-auto grid max-w-7xl divide-y divide-stone-200 px-5 sm:px-8 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
        {chapters.map((chapter) => (
          <Link
            className="group relative flex items-center gap-6 overflow-hidden py-8 transition-colors hover:bg-stone-50 lg:px-8"
            href={chapter.href}
            key={chapter.number}
          >
            <DecorativeElement
              className="right-5 top-3 h-16 w-16 opacity-70"
              variant="compass"
            />
            <span className="font-serif text-3xl text-stone-300 transition-colors group-hover:text-stone-500">
              {chapter.number}
            </span>
            <span className="text-sm font-medium uppercase tracking-[0.24em] text-stone-700">
              {chapter.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
