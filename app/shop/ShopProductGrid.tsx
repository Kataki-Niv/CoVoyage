"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import type { TravelProduct } from "./productData";

const categories = [
  "All",
  "Packing",
  "Tech",
  "Comfort",
  "Outdoor",
  "Organization",
] as const;

type FilterCategory = (typeof categories)[number];

type ShopProductGridProps = {
  products: TravelProduct[];
  initialCategory?: string;
  destination?: string;
};

function isFilterCategory(value: string): value is FilterCategory {
  return categories.includes(value as FilterCategory);
}

export function ShopProductGrid({
  products,
  initialCategory = "All",
  destination,
}: ShopProductGridProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const activeCategory = isFilterCategory(initialCategory)
    ? initialCategory
    : "All";

  const updateCategory = (category: FilterCategory) => {
    const searchParams = new URLSearchParams();

    if (destination) {
      searchParams.set("destination", destination);
    }

    if (category !== "All") {
      searchParams.set("category", category);
    }

    const queryString = searchParams.toString();
    startTransition(() => {
      router.push(`/shop${queryString ? `?${queryString}` : ""}`, {
        scroll: false,
      });
    });
  };

  return (
    <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
      {destination ? (
        <div className="mb-5 border border-[#d8b7aa]/18 bg-[#2a211d] px-4 py-3 text-xs font-medium uppercase tracking-[0.18em] text-[#d8b7aa]">
          Showing essentials for {destination}
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2 border-y border-white/10 py-5">
        {categories.map((category) => (
          <button
            className={
              activeCategory === category
                ? "border border-[#d8b7aa] bg-[#d8b7aa] px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-[#050505]"
                : "border border-white/10 bg-white/[0.035] px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-white/62 transition-colors hover:border-white/30 hover:text-white"
            }
            key={category}
            disabled={isPending}
            onClick={() => updateCategory(category)}
            type="button"
          >
            {category}
          </button>
        ))}
      </div>

      {products.length ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <article
            className="group border border-white/10 bg-[#111] p-4"
            key={product.slug}
          >
            <Link href={`/shop/${product.slug}`}>
              <div className="relative aspect-[4/3] overflow-hidden bg-[#151515]">
                <Image
                  alt={product.imageAlt}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, calc(100vw - 72px)"
                  src={product.image}
                />
              </div>
            </Link>
            <div className="px-1 py-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#d8b7aa]">
                  {product.category}
                </p>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/50">
                  {product.price}
                </p>
              </div>
              <h2 className="mt-3 font-serif text-3xl leading-tight text-white">
                {product.name}
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/58">
                {product.description}
              </p>
              <Link
                className="mt-5 inline-flex border border-white/20 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-white/72 transition-colors hover:border-white/40 hover:text-white"
                href={`/shop/${product.slug}`}
              >
                View Item
              </Link>
            </div>
          </article>
        ))}
        </div>
      ) : (
        <div className="mt-10 border border-white/10 bg-[#111] p-6 text-sm leading-6 text-white/62">
          No essentials match this destination and category yet.
        </div>
      )}
    </section>
  );
}
