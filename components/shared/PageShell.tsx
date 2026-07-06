import type { ReactNode } from "react";

import { DecorativeElement } from "@/components/home/DecorativeElements";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { cn } from "@/lib/utils";

type PageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
};

export function PageShell({
  eyebrow,
  title,
  description,
  children,
  className,
}: PageShellProps) {
  return (
    <div className="min-h-screen bg-[#fbf8f2] text-stone-900">
      <Navbar />
      <main className={cn("relative overflow-hidden", className)}>
        <DecorativeElement className="-left-10 top-24 hidden lg:grid" />
        <DecorativeElement
          className="right-4 top-24 h-28 w-28"
          variant="compass"
        />
        <section className="mx-auto max-w-7xl px-5 pb-10 pt-16 text-center sm:px-8">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.38em] text-stone-500">
            {eyebrow}
          </p>
          <h1 className="mx-auto max-w-4xl font-serif text-5xl leading-tight text-stone-900 sm:text-6xl">
            {title}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-stone-600">
            {description}
          </p>
        </section>
        {children}
      </main>
      <Footer />
    </div>
  );
}
