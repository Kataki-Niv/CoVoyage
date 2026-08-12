import Image from "next/image";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

import { products } from "./productData";
import { ShopProductGrid } from "./ShopProductGrid";

export const metadata = {
  title: "Travel Essentials | CoVoyage",
  description:
    "A curated CoVoyage edit of useful travel essentials for thoughtful journeys.",
};

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-[#fbf8f2] text-stone-900">
      <Navbar />
      <main>
        <section className="px-5 pb-12 pt-10 sm:px-8 lg:pb-16">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.44fr_0.56fr] lg:items-end">
            <div className="pb-2">
              <p className="text-xs font-medium uppercase tracking-[0.38em] text-stone-500">
                Travel Essentials
              </p>
              <h1 className="mt-4 font-serif text-5xl leading-tight text-stone-950 sm:text-6xl">
                Small things that make the journey easier.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-stone-600">
                CoVoyage has curated a compact edit of useful travel items for
                packing, movement, comfort, outdoor days, and calmer
                organization on the road.
              </p>
            </div>
            <figure className="relative min-h-[420px] overflow-hidden border border-stone-200 bg-stone-200 lg:min-h-[540px]">
              <Image
                alt="Carefully arranged travel essentials beside a packed bag"
                className="absolute inset-0 h-full w-full object-cover"
                fill
                priority
                sizes="(min-width: 1024px) 56vw, calc(100vw - 40px)"
                src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1800&q=88"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(251,248,242,0.02),rgba(64,52,45,0.18))]" />
            </figure>
          </div>
        </section>
        <ShopProductGrid products={products} />
      </main>
      <Footer />
    </div>
  );
}
