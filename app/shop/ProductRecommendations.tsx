"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import type { ProductCategory, TravelProduct } from "./productData";

const productFilters = ["All", "Packing", "Tech", "Comfort", "Outdoor", "Organization"] as const;
type ProductFilter = "All" | ProductCategory;

export function ProductRecommendations({
  currentProduct,
  products,
}: {
  currentProduct: TravelProduct;
  products: TravelProduct[];
}) {
  const [activeFilter, setActiveFilter] = useState<ProductFilter>(currentProduct.category);
  const otherProducts = products.filter((candidate) => {
    if (candidate.slug === currentProduct.slug) {
      return false;
    }

    return activeFilter === "All" || candidate.category === activeFilter;
  });

  return (
    <div className="border-t border-white/10 pt-10">
      <p className="text-xs font-medium uppercase tracking-[0.28em] text-white/46">
        Continue Browsing
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {productFilters.map((filter) => (
          <button
            className={
              activeFilter === filter
                ? "h-10 rounded-full bg-[#f8f4ea] px-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#050505]"
                : "h-10 rounded-full border border-white/14 px-5 text-xs font-semibold uppercase tracking-[0.18em] text-white/58 transition-colors hover:border-white/40 hover:text-white"
            }
            key={filter}
            onClick={() => setActiveFilter(filter)}
            type="button"
          >
            {filter}
          </button>
        ))}
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {otherProducts.map((otherProduct) => (
          <article
            className="group border border-white/10 bg-[#111] p-4"
            key={otherProduct.slug}
          >
            <Link href={`/shop/${otherProduct.slug}`}>
              <div className="relative aspect-[4/3] overflow-hidden bg-[#151515]">
                <Image
                  alt={otherProduct.imageAlt}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, calc(100vw - 72px)"
                  src={otherProduct.image}
                />
              </div>
            </Link>
            <div className="px-1 py-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#d8b7aa]">
                  {otherProduct.category}
                </p>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/50">
                  Estimated Price {otherProduct.price}
                </p>
              </div>
              <h2 className="mt-3 font-serif text-3xl leading-tight text-white">
                {otherProduct.name}
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/58">
                {otherProduct.description}
              </p>
              <Link
                className="mt-5 inline-flex border border-white/20 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-white/72 transition-colors hover:border-white/40 hover:text-white"
                href={`/shop/${otherProduct.slug}`}
              >
                View Item
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

