"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import type { ProductCategory, TravelProduct } from "./productData";

const categories = [
  "All",
  "Packing",
  "Tech",
  "Comfort",
  "Outdoor",
  "Organization",
] as const;

type FilterCategory = (typeof categories)[number];

export function ShopProductGrid({ products }: { products: TravelProduct[] }) {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("All");

  const visibleProducts = useMemo(() => {
    if (activeCategory === "All") {
      return products;
    }

    return products.filter(
      (product) => product.category === (activeCategory as ProductCategory),
    );
  }, [activeCategory, products]);

  return (
    <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
      <div className="flex flex-wrap gap-2 border-y border-stone-200 py-5">
        {categories.map((category) => (
          <button
            className={
              activeCategory === category
                ? "border border-stone-900 bg-stone-900 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-[#fbf8f2]"
                : "border border-stone-200 bg-white/60 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-stone-600 transition-colors hover:border-stone-400 hover:text-stone-950"
            }
            key={category}
            onClick={() => setActiveCategory(category)}
            type="button"
          >
            {category}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visibleProducts.map((product) => (
          <article
            className="group border border-stone-200 bg-white/72 p-4 shadow-sm shadow-stone-200/40"
            key={product.slug}
          >
            <Link href={`/shop/${product.slug}`}>
              <div className="relative aspect-[4/3] overflow-hidden bg-stone-200">
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
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-stone-500">
                  {product.category}
                </p>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">
                  {product.price}
                </p>
              </div>
              <h2 className="mt-3 font-serif text-3xl leading-tight text-stone-900">
                {product.name}
              </h2>
              <p className="mt-3 text-sm leading-6 text-stone-600">
                {product.description}
              </p>
              <Link
                className="mt-5 inline-flex border border-stone-300 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-stone-700 transition-colors hover:border-stone-900 hover:bg-stone-900 hover:text-[#fbf8f2]"
                href={`/shop/${product.slug}`}
              >
                View Item
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
