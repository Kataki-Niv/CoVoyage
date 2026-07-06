import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { DecorativeElement } from "@/components/home/DecorativeElements";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FeatureSectionProps = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
  imageSide?: "left" | "right";
  palette: "sage" | "sand" | "rose";
};

const palettes = {
  sage: "from-[#d4ddd1] via-[#a9b9a2] to-[#6f806d]",
  sand: "from-[#ead9bd] via-[#c8aa80] to-[#8f765c]",
  rose: "from-[#ead5cf] via-[#c7a59a] to-[#75635f]",
};

export function FeatureSection({
  id,
  eyebrow,
  title,
  description,
  ctaLabel,
  href,
  imageSide = "left",
  palette,
}: FeatureSectionProps) {
  const image = (
    <div className="relative min-h-[360px] overflow-hidden rounded-[4px] bg-stone-200">
      <div className={cn("absolute inset-0 bg-gradient-to-br", palettes[palette])} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_26%,rgba(255,255,255,0.48),transparent_20%),repeating-linear-gradient(135deg,rgba(255,255,255,0.22)_0_1px,transparent_1px_18px)]" />
      <DecorativeElement className="bottom-7 left-7 h-24 w-24 border-white/40 text-white/60" />
      <p className="absolute bottom-8 right-8 max-w-44 text-right font-serif text-4xl leading-tight text-white/80">
        {title}
      </p>
    </div>
  );

  const copy = (
    <div className="relative flex flex-col justify-center py-4">
      <DecorativeElement className="-right-8 -top-8 h-32 w-32" variant="compass" />
      <p className="mb-4 text-xs font-medium uppercase tracking-[0.34em] text-stone-500">
        {eyebrow}
      </p>
      <h2 className="font-serif text-4xl leading-tight text-stone-900 sm:text-5xl">
        {title}
      </h2>
      <p className="mt-6 max-w-xl text-base leading-8 text-stone-600">
        {description}
      </p>
      <Button asChild className="mt-8 w-fit" size="lg">
        <Link href={href}>
          {ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );

  return (
    <section className="scroll-mt-28 px-5 py-16 sm:px-8 lg:py-24" id={id}>
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:gap-16">
        {imageSide === "left" ? (
          <>
            {image}
            {copy}
          </>
        ) : (
          <>
            <div className="lg:order-2">{image}</div>
            <div className="lg:order-1">{copy}</div>
          </>
        )}
      </div>
    </section>
  );
}
