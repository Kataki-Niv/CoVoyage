import { apiRequest } from "@/lib/api";

export type EssentialsProduct = {
  slug: string;
  name: string;
  category: string;
  categories?: string[];
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

export type EssentialsProductQuery = {
  category?: string;
  destination?: string;
};

export function getEssentialsProducts({
  category,
  destination,
}: EssentialsProductQuery = {}) {
  const searchParams = new URLSearchParams();

  if (category) {
    searchParams.set("category", category);
  }

  if (destination) {
    searchParams.set("destination", destination);
  }

  const queryString = searchParams.toString();
  return apiRequest<EssentialsProduct[]>(
    `/essentials/products${queryString ? `?${queryString}` : ""}`,
  );
}

export type BackpackItem = {
  id: string;
  user_id: string;
  product_slug: string;
  quantity: number;
  unit_price_cents: number;
  line_total_cents: number;
  currency: string;
  product?: EssentialsProduct | null;
  created_at: string;
  updated_at: string;
};

export function getBackpackItems(token: string) {
  return apiRequest<BackpackItem[]>("/backpack", { token });
}

export function addBackpackItem(
  productSlug: string,
  token: string,
  quantity = 1,
) {
  return apiRequest<BackpackItem>("/backpack", {
    method: "POST",
    token,
    body: JSON.stringify({
      product_slug: productSlug,
      quantity,
    }),
  });
}

export function updateBackpackItem(
  itemId: string,
  quantity: number,
  token: string,
) {
  return apiRequest<BackpackItem>(`/backpack/${encodeURIComponent(itemId)}`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ quantity }),
  });
}

export function removeBackpackItem(itemId: string, token: string) {
  return apiRequest<void>(`/backpack/${encodeURIComponent(itemId)}`, {
    method: "DELETE",
    token,
  });
}

export function clearBackpack(token: string) {
  return apiRequest<void>("/backpack", {
    method: "DELETE",
    token,
  });
}
