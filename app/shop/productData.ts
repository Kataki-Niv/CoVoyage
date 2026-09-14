import essentialsProducts from "@/data/essentials-products.json";

export type ProductCategory =
  | "Packing"
  | "Tech"
  | "Comfort"
  | "Outdoor"
  | "Organization";

export type TravelProduct = {
  slug: string;
  name: string;
  category: ProductCategory;
  categories?: ProductCategory[];
  description: string;
  price: string;
  price_cents: number;
  currency: string;
  image: string;
  imageAlt: string;
  whyUseful: string;
  details: string[];
  general: boolean;
  destinations: string[];
  destination_priority?: Record<string, number>;
  contexts: string[];
  status: "available" | "unavailable";
};

export const products = essentialsProducts as TravelProduct[];

export const featuredEssentials = products.slice(0, 4);

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}
