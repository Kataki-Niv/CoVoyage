import Image from "next/image";
import { notFound } from "next/navigation";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { HistoryBackButton } from "@/components/shared/HistoryBackButton";

import { AddToBagButton } from "../AddToBagButton";
import { ProductRecommendations } from "../ProductRecommendations";
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

            <div className="mt-8 grid gap-9 lg:grid-cols-[0.5fr_0.5fr] lg:items-start">
              <figure className="relative min-h-[360px] overflow-hidden border border-white/10 bg-[#151515] lg:min-h-[560px]">
                <Image
                  alt={product.imageAlt}
                  className="absolute inset-0 h-full w-full object-cover"
                  fill
                  priority
                  sizes="(min-width: 1024px) 50vw, calc(100vw - 40px)"
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
                  Estimated Price {product.price}
                </p>
                <p className="mt-6 text-base leading-8 text-white/64">
                  {`${product.description} Includes ${product.details
                    .map((detail) => detail.toLowerCase())
                    .join(", ")}.`}
                </p>
                <div className="mt-8">
                  <AddToBagButton productSlug={product.slug} />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:pb-24">
          <ProductRecommendations currentProduct={product} products={products} />
        </section>
      </main>
      <Footer />
    </div>
  );
}

