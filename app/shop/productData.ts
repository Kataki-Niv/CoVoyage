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
  description: string;
  price: string;
  image: string;
  imageAlt: string;
  whyUseful: string;
  details: string[];
};

export const products: TravelProduct[] = [
  {
    slug: "compression-packing-cubes",
    name: "Compression Packing Cubes",
    category: "Packing",
    description: "A tidy way to separate layers, laundry, and one-bag outfits.",
    price: "$34",
    image:
      "https://images.unsplash.com/photo-1553531384-cc64ac80f931?auto=format&fit=crop&w=1200&q=86",
    imageAlt: "Organized travel packing layout with folded clothes",
    whyUseful:
      "They make repacking faster on multi-stop trips and help keep clean layers separate from worn pieces.",
    details: ["Set of 4 cubes", "Lightweight nylon", "Compression zip panels"],
  },
  {
    slug: "lightweight-luggage-organizer",
    name: "Lightweight Luggage Organizer",
    category: "Packing",
    description: "Slim compartments for travelers who like every item to have a place.",
    price: "$28",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=86",
    imageAlt: "Packed travel bag with neatly arranged essentials",
    whyUseful:
      "A simple organizer turns a carry-on into a calmer system, especially for train days and quick hotel changes.",
    details: ["Flat document sleeve", "Mesh pockets", "Carry-on friendly"],
  },
  {
    slug: "universal-travel-adapter",
    name: "Universal Travel Adapter",
    category: "Tech",
    description: "One compact plug hub for charging the essentials abroad.",
    price: "$32",
    image:
      "https://images.unsplash.com/photo-1603539444875-76e7684265f6?auto=format&fit=crop&w=1200&q=86",
    imageAlt: "Travel adapter and small tech items on a table",
    whyUseful:
      "It reduces cable chaos and keeps phones, cameras, and headphones ready during long travel days.",
    details: ["Multi-region plug support", "USB ports", "Compact shell"],
  },
  {
    slug: "compact-power-bank",
    name: "Compact Power Bank",
    category: "Tech",
    description: "Pocketable backup power for maps, tickets, and translation apps.",
    price: "$46",
    image:
      "https://images.unsplash.com/photo-1609592806596-b43a661a5f78?auto=format&fit=crop&w=1200&q=86",
    imageAlt: "Portable charger beside travel technology",
    whyUseful:
      "A spare charge can turn a stressful low-battery transfer into a normal travel day.",
    details: ["10,000 mAh capacity", "USB-C charging", "Slim travel profile"],
  },
  {
    slug: "memory-foam-travel-pillow",
    name: "Memory Foam Travel Pillow",
    category: "Comfort",
    description: "Soft support for overnight flights and long bus windows.",
    price: "$39",
    image:
      "https://images.unsplash.com/photo-1520437358207-323b43b50729?auto=format&fit=crop&w=1200&q=86",
    imageAlt: "Travel pillow and blanket on a calm seat",
    whyUseful:
      "A better rest setup makes arrival days feel less like recovery missions.",
    details: ["Memory foam fill", "Washable cover", "Clip-on travel strap"],
  },
  {
    slug: "lightweight-travel-blanket",
    name: "Lightweight Travel Blanket",
    category: "Comfort",
    description: "A small layer for cold cabins, ferries, and early trains.",
    price: "$42",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=86",
    imageAlt: "Cozy travel scene overlooking mountains",
    whyUseful:
      "A packable blanket helps with chilly transit, picnic stops, and unpredictable accommodation temperatures.",
    details: ["Packs into pouch", "Soft woven feel", "Machine washable"],
  },
  {
    slug: "compact-daypack",
    name: "Compact Daypack",
    category: "Outdoor",
    description: "A foldable pack for hikes, markets, and one-day side trips.",
    price: "$58",
    image:
      "https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=1200&q=86",
    imageAlt: "Small backpack on a mountain trail",
    whyUseful:
      "It gives you room for layers, snacks, water, and camera gear without bringing the full travel bag.",
    details: ["18L capacity", "Water-resistant finish", "Internal pocket"],
  },
  {
    slug: "reusable-water-bottle",
    name: "Reusable Water Bottle",
    category: "Outdoor",
    description: "A durable bottle for city walks, trail days, and airport refills.",
    price: "$26",
    image:
      "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=1200&q=86",
    imageAlt: "Reusable bottle beside outdoor travel gear",
    whyUseful:
      "Staying hydrated is simpler when your bottle is always easy to reach and refill.",
    details: ["Insulated stainless steel", "Leak-resistant cap", "750 ml"],
  },
  {
    slug: "passport-holder",
    name: "Passport Holder",
    category: "Organization",
    description: "A slim sleeve for passport, cards, and arrival documents.",
    price: "$24",
    image:
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=86",
    imageAlt: "Passport and travel documents on a table",
    whyUseful:
      "It keeps the essentials together during check-ins, border crossings, and hotel arrivals.",
    details: ["Passport sleeve", "Card slots", "Boarding pass pocket"],
  },
  {
    slug: "travel-document-organizer",
    name: "Travel Document Organizer",
    category: "Organization",
    description: "A low-profile folder for tickets, receipts, SIM cards, and backup copies.",
    price: "$31",
    image:
      "https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?auto=format&fit=crop&w=1200&q=86",
    imageAlt: "Travel notebook, documents, and planning items",
    whyUseful:
      "It gives every trip paper a home, which matters most when plans change quickly.",
    details: ["Zip closure", "Multiple dividers", "Pen loop"],
  },
];

export const featuredEssentials = products.slice(0, 4);

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}
