import Image from "next/image";
import { notFound } from "next/navigation";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { HistoryBackButton } from "@/components/shared/HistoryBackButton";

import { AddToBagButton } from "../AddToBagButton";
import { getProduct, products } from "../productData";

type ProductPageProps = {
  params: Promise<{
    productSlug: string;
  }>;
};

export function generateStaticParams() {
  return products.map((product) => ({
    productSlug: product.slug,
  }));
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { productSlug } = await params;
  const product = getProduct(productSlug);

  if (!product) {
    return {
      title: "Travel Essential | CoVoyage",
    };
  }

  return {
    title: `${product.name} | CoVoyage Travel Essentials`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { productSlug } = await params;
  const product = getProduct(productSlug);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#fbf8f2] text-stone-900">
      <Navbar />
      <main>
        <section className="px-5 py-10 sm:px-8 lg:py-16">
          <div className="mx-auto max-w-7xl">
            <HistoryBackButton
              className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-stone-600 transition-colors hover:text-stone-950"
            >
              Back to Travel Essentials
            </HistoryBackButton>

            <div className="mt-8 grid gap-9 lg:grid-cols-[0.54fr_0.46fr] lg:items-start">
              <figure className="relative min-h-[420px] overflow-hidden border border-stone-200 bg-stone-200 lg:min-h-[650px]">
                <Image
                  alt={product.imageAlt}
                  className="absolute inset-0 h-full w-full object-cover"
                  fill
                  priority
                  sizes="(min-width: 1024px) 54vw, calc(100vw - 40px)"
                  src={product.image}
                />
              </figure>

              <div className="border-y border-stone-200 py-8 lg:sticky lg:top-28">
                <p className="text-xs font-medium uppercase tracking-[0.34em] text-stone-500">
                  {product.category}
                </p>
                <h1 className="mt-4 font-serif text-5xl leading-tight text-stone-950 sm:text-6xl">
                  {product.name}
                </h1>
                <p className="mt-5 text-2xl font-light text-stone-700">
                  {product.price}
                </p>
                <p className="mt-6 text-base leading-8 text-stone-600">
                  {product.description}
                </p>
                <div className="mt-8">
                  <AddToBagButton />
                </div>

                <div className="mt-10 border-t border-stone-200 pt-8">
                  <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500">
                    Why it is useful for travelers
                  </p>
                  <p className="mt-4 text-sm leading-7 text-stone-600">
                    {product.whyUseful}
                  </p>
                </div>

                <div className="mt-8 border-t border-stone-200 pt-8">
                  <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500">
                    Basic Details
                  </p>
                  <ul className="mt-4 space-y-3">
                    {product.details.map((detail) => (
                      <li
                        className="border-l border-stone-300 pl-4 text-sm leading-6 text-stone-600"
                        key={detail}
                      >
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
