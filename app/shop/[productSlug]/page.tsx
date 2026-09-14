import Image from "next/image";
import Link from "next/link";
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

  const otherProducts = products.filter(
    (candidate) => candidate.slug !== productSlug,
  );

  return (
    <div
      className="min-h-screen bg-[#050505] text-[#f8f4ea]"
      style={{ backgroundColor: "#050505" }}
    >
      <Navbar />
      <main>
        <section className="px-5 py-10 sm:px-8 lg:py-16">
          <div className="mx-auto max-w-7xl">
            <HistoryBackButton
              className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-white/62 transition-colors hover:text-white"
            >
              Back to Travel Essentials
            </HistoryBackButton>

            <div className="mt-8 grid gap-9 lg:grid-cols-[0.54fr_0.46fr] lg:items-start">
              <figure className="relative min-h-[420px] overflow-hidden border border-white/10 bg-[#151515] lg:min-h-[650px]">
                <Image
                  alt={product.imageAlt}
                  className="absolute inset-0 h-full w-full object-cover"
                  fill
                  priority
                  sizes="(min-width: 1024px) 54vw, calc(100vw - 40px)"
                  src={product.image}
                />
              </figure>

              <div className="border-y border-white/10 py-8 lg:sticky lg:top-28">
                <p className="text-xs font-medium uppercase tracking-[0.34em] text-[#d8b7aa]">
                  {product.category}
                </p>
                <h1 className="mt-4 font-serif text-5xl leading-tight text-white sm:text-6xl">
                  {product.name}
                </h1>
                <p className="mt-5 text-2xl font-light text-white/72">
                  {product.price}
                </p>
                <p className="mt-6 text-base leading-8 text-white/64">
                  {product.description}
                </p>
                <div className="mt-8">
                  <AddToBagButton productSlug={product.slug} />
                </div>

                <div className="mt-10 border-t border-white/10 pt-8">
                  <p className="text-xs font-medium uppercase tracking-[0.28em] text-white/46">
                    Why it is useful for travelers
                  </p>
                  <p className="mt-4 text-sm leading-7 text-white/62">
                    {product.whyUseful}
                  </p>
                </div>

                <div className="mt-8 border-t border-white/10 pt-8">
                  <p className="text-xs font-medium uppercase tracking-[0.28em] text-white/46">
                    Basic Details
                  </p>
                  <ul className="mt-4 space-y-3">
                    {product.details.map((detail) => (
                      <li
                        className="border-l border-[#d8b7aa]/28 pl-4 text-sm leading-6 text-white/62"
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
        <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:pb-24">
          <div className="border-t border-white/10 pt-10">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-white/46">
              Continue Browsing
            </p>
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
                        {otherProduct.price}
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
        </section>
      </main>
      <Footer />
    </div>
  );
}
