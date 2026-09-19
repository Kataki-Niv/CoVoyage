import Image from "next/image";
import Link from "next/link";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { getEssentialsProducts } from "@/lib/essentialsApi";

import type { TravelProduct } from "./productData";
import { ShopProductGrid } from "./ShopProductGrid";

export const metadata = {
  title: "Travel Essentials | CoVoyage",
  description:
    "A curated CoVoyage edit of useful travel essentials for thoughtful journeys.",
};

type ShopPageProps = {
  searchParams?: Promise<{
    category?: string;
    destination?: string;
  }>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const resolvedSearchParams = await searchParams;
  const category = resolvedSearchParams?.category;
  const destination = resolvedSearchParams?.destination;
  const products = (await getEssentialsProducts({
    category,
    destination,
  })) as TravelProduct[];

  return (
    <div
      className="min-h-screen bg-[#050505] text-[#f8f4ea]"
      style={{ backgroundColor: "#050505" }}
    >
      <Navbar />
      <main>
        <section className="px-5 pb-12 pt-10 sm:px-8 lg:pb-16">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.44fr_0.56fr] lg:items-end">
            <div className="pb-2">
              <p className="text-xs font-medium uppercase tracking-[0.38em] text-white/46">
                Travel Essentials
              </p>
              <h1 className="mt-4 font-serif text-5xl leading-tight text-white sm:text-6xl">
                Small things that make the journey easier.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-white/64">
                CoVoyage has curated a compact edit of useful travel items for
                packing, movement, comfort, outdoor days, and calmer
                organization on the road.
              </p>
              <Link
                className="mt-7 inline-flex h-11 items-center justify-center border border-[#f8f4ea]/70 bg-[#f8f4ea] px-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#050505] transition-colors hover:border-white hover:bg-white"
                href="/essentials/bag"
              >
                View Planning Bag
              </Link>
            </div>
            <figure className="relative min-h-[420px] overflow-hidden border border-white/10 bg-[#151515] lg:min-h-[540px]">
              <Image
                alt="Carefully arranged travel essentials beside a packed bag"
                className="absolute inset-0 h-full w-full object-cover"
                fill
                priority
                sizes="(min-width: 1024px) 56vw, calc(100vw - 40px)"
                src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1800&q=88"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.02),rgba(5,5,5,0.72)),linear-gradient(90deg,rgba(5,5,5,0.42),rgba(5,5,5,0.04))]" />
            </figure>
          </div>
        </section>
        <ShopProductGrid
          destination={destination}
          initialCategory={category}
          products={products}
        />
      </main>
      <Footer />
    </div>
  );
}
