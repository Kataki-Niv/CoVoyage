type CuratedPlaceImage = {
  image: string;
  imageAlt: string;
};

const curatedPlaceImages: Record<string, CuratedPlaceImage> = {
  "antigua-guatemala": {
    image:
      "https://images.unsplash.com/photo-1602120012884-6aa678fa79c7?auto=format&fit=crop&w=1200&q=84",
    imageAlt: "Antigua Guatemala archway and cobblestone street",
  },
  bariloche: {
    image:
      "https://images.unsplash.com/photo-1691712988368-ab9cb6cd6ef3?auto=format&fit=crop&w=1200&q=84",
    imageAlt: "Bariloche lake and mountains in Patagonia",
  },
  "el-calafate": {
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=84",
    imageAlt: "Patagonia mountain and glacier route landscape",
  },
  "garden-route": {
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=84",
    imageAlt: "South African coastal route beach and ocean",
  },
  "iguazu-falls": {
    image:
      "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1200&q=84",
    imageAlt: "Wide waterfall and rainforest landscape",
  },
  marrakech: {
    image:
      "https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&w=1200&q=84",
    imageAlt: "Marrakech medina street and warm architecture",
  },
  mendoza: {
    image:
      "https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=1200&q=84",
    imageAlt: "Vineyard rows and rural landscape",
  },
  pamukkale: {
    image:
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=84",
    imageAlt: "Turkey heritage landscape in warm light",
  },
  "stellenbosch-winelands": {
    image:
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=84",
    imageAlt: "Wine glasses and vineyard region table",
  },
};

const curatedCountryHeroImages: Record<string, CuratedPlaceImage> = {
  guatemala: {
    image:
      "https://images.unsplash.com/photo-1602120012884-6aa678fa79c7?auto=format&fit=crop&w=1800&q=85",
    imageAlt: "Antigua Guatemala archway and cobblestone street",
  },
  morocco: {
    image:
      "https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&w=1800&q=85",
    imageAlt: "Moroccan medina street and warm architecture",
  },
};

export function getCuratedPlaceImage(placeSlug: string | undefined) {
  if (!placeSlug) {
    return null;
  }

  return curatedPlaceImages[placeSlug] ?? null;
}

export function getCuratedCountryHeroImage(countrySlug: string | undefined) {
  if (!countrySlug) {
    return null;
  }

  return curatedCountryHeroImages[countrySlug] ?? null;
}
