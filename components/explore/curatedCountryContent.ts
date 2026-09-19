import type { DestinationEvent } from "@/components/explore/destinationData";

const eventImage =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=84";

export const curatedDemoEventsByCountrySlug: Record<string, DestinationEvent[]> = {
  argentina: [
    {
      title: "Buenos Aires Tango and San Telmo Market Route",
      category: "Culture",
      location: "Buenos Aires",
      date: "Curated seasonal listing",
      description:
        "A demo cultural route pairing neighborhood tango history, cafe stops, antique stalls, and late-evening city rhythm.",
      image:
        "https://images.unsplash.com/photo-1612294037637-ec328d0e075e?auto=format&fit=crop&w=600&q=84",
      imageAlt: "Buenos Aires architecture and city street",
    },
  ],
  canada: [
    {
      title: "Banff Lakes and Mountain Shuttle Day",
      category: "Nature",
      location: "Banff National Park",
      date: "Curated summer listing",
      description:
        "A planning-focused mountain day built around lake access, park shuttles, trail etiquette, and early starts in the Rockies.",
      image:
        "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=84",
      imageAlt: "Canadian Rocky Mountain lake and peaks",
    },
  ],
  france: [
    {
      title: "Provence Lavender Market Morning",
      category: "Food / Culture",
      location: "Provence",
      date: "Curated summer listing",
      description:
        "A curated village-market route through lavender-country stalls, local produce, hill towns, and warm evening squares.",
      image:
        "https://images.unsplash.com/photo-1499002238440-d264edd596ec?auto=format&fit=crop&w=600&q=84",
      imageAlt: "Provence village and summer landscape",
    },
  ],
  guatemala: [
    {
      title: "Antigua Coffee Courtyard and Artisan Market Walk",
      category: "Culture",
      location: "Antigua Guatemala",
      date: "Curated rainy-season listing",
      description:
        "A compact demo walk through courtyard cafes, craft markets, volcano viewpoints, and realistic afternoon-rain pacing.",
      image:
        "https://images.unsplash.com/photo-1602120012884-6aa678fa79c7?auto=format&fit=crop&w=600&q=84",
      imageAlt: "Antigua Guatemala archway and cobblestone street",
    },
  ],
  iceland: [
    {
      title: "Reykjavik Culture Night Route",
      category: "Culture",
      location: "Reykjavik",
      date: "Curated summer listing",
      description:
        "A demo city route through museums, harbor walks, music spaces, pools, and late-light neighborhood wandering.",
      image:
        "https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=600&q=84",
      imageAlt: "Reykjavik buildings under northern light",
    },
  ],
  indonesia: [
    {
      title: "Ubud Temple Arts Evening",
      category: "Arts",
      location: "Ubud, Bali",
      date: "Curated dry-season listing",
      description:
        "A demo evening pairing temple etiquette, dance performance context, craft streets, and unhurried dinner planning.",
      image:
        "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=84",
      imageAlt: "Balinese temple and tropical greenery",
    },
  ],
  italy: [
    {
      title: "Tuscany Village Food and Harvest Table",
      category: "Food",
      location: "Tuscany",
      date: "Curated late-summer listing",
      description:
        "A country-specific demo listing built around market produce, regional pasta, vineyard villages, and slow evening meals.",
      image:
        "https://images.unsplash.com/photo-1541370976299-4d24ebbc9077?auto=format&fit=crop&w=600&q=84",
      imageAlt: "Tuscan city view and warm Italian architecture",
    },
  ],
  japan: [
    {
      title: "Kyoto Lantern Lane Evening",
      category: "Culture",
      location: "Kyoto",
      date: "Curated summer listing",
      description:
        "A demo cultural evening around lantern-lit lanes, temple-area manners, seasonal sweets, and quiet walking routes.",
      image:
        "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=600&q=84",
      imageAlt: "Traditional Kyoto temple in warm evening light",
    },
  ],
  kenya: [
    {
      title: "Nairobi Storytelling and Maasai Market Day",
      category: "Culture",
      location: "Nairobi",
      date: "Curated listing",
      description:
        "A demo city listing focused on craft markets, Kenyan design, food stops, and respectful community-led cultural context.",
      image:
        "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=84",
      imageAlt: "Kenyan savanna landscape at golden hour",
    },
  ],
  mexico: [
    {
      title: "Oaxaca Market Mole Evening",
      category: "Food",
      location: "Oaxaca",
      date: "Curated listing",
      description:
        "A demo food-culture route through market stalls, mole traditions, artisan streets, and evening plaza atmosphere.",
      image:
        "https://images.unsplash.com/photo-1512813195386-6cf811ad3542?auto=format&fit=crop&w=600&q=84",
      imageAlt: "Colorful Mexican street and historic architecture",
    },
  ],
  morocco: [
    {
      title: "Marrakech Medina Storytelling Evening",
      category: "Culture",
      location: "Marrakech",
      date: "Curated listing",
      description:
        "A demo medina evening around souk pacing, tea culture, food stalls, and the storytelling atmosphere of the old city.",
      image:
        "https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&w=600&q=84",
      imageAlt: "Moroccan medina street and warm architecture",
    },
  ],
  "new-zealand": [
    {
      title: "Rotorua Maori Arts and Geothermal Evening",
      category: "Culture / Nature",
      location: "Rotorua",
      date: "Curated winter listing",
      description:
        "A curated demo experience connecting geothermal landscapes, Maori arts context, local food, and respectful visitor protocol.",
      image:
        "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=600&q=84",
      imageAlt: "New Zealand mountain and lake landscape",
    },
  ],
  norway: [
    {
      title: "Bergen Fjord Music and Seafood Evening",
      category: "Culture / Food",
      location: "Bergen",
      date: "Curated summer listing",
      description:
        "A demo harbor evening shaped around fjord access, seafood stalls, rainy-day museums, and local music venues.",
      image:
        "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=84",
      imageAlt: "Norwegian fjord town and water",
    },
  ],
  peru: [
    {
      title: "Cusco Andean Textile and Market Day",
      category: "Culture",
      location: "Cusco",
      date: "Curated dry-season listing",
      description:
        "A demo highland day around textile traditions, market pacing, acclimatization-aware walking, and Andean food.",
      image:
        "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=600&q=84",
      imageAlt: "Peru mountain ruins and Andean landscape",
    },
  ],
  portugal: [
    {
      title: "Porto Fado and Ribeira Food Evening",
      category: "Music / Food",
      location: "Porto",
      date: "Curated summer listing",
      description:
        "A demo evening route through riverfront streets, tiled facades, small plates, and Portuguese music context.",
      image:
        "https://images.unsplash.com/photo-1513735492246-483525079686?auto=format&fit=crop&w=600&q=84",
      imageAlt: "Porto riverside buildings and tiled cityscape",
    },
  ],
  "south-africa": [
    {
      title: "Cape Town Gallery Night and Food Market Route",
      category: "Arts / Food",
      location: "Cape Town",
      date: "Curated listing",
      description:
        "A demo urban route through gallery streets, design spaces, food markets, and Table Mountain-backed city evenings.",
      image:
        "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=600&q=84",
      imageAlt: "Cape Town city and Table Mountain",
    },
  ],
  spain: [
    {
      title: "Seville Tapas and Flamenco Night",
      category: "Culture / Food",
      location: "Seville",
      date: "Curated summer listing",
      description:
        "A demo evening built around Andalusian streets, tapas pacing, flamenco context, and heat-aware late-night rhythm.",
      image:
        "https://images.unsplash.com/photo-1558642084-fd07fae5282e?auto=format&fit=crop&w=600&q=84",
      imageAlt: "Warm Andalusian city street with evening lights",
    },
  ],
  thailand: [
    {
      title: "Chiang Mai Lanna Craft and Night Market Walk",
      category: "Culture",
      location: "Chiang Mai",
      date: "Curated listing",
      description:
        "A demo northern Thailand evening with temple manners, Lanna craft context, food stalls, and market pacing.",
      image:
        "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=600&q=84",
      imageAlt: "Thai temple and warm city scene",
    },
  ],
  turkey: [
    {
      title: "Istanbul Bosphorus Culture Evening",
      category: "Culture",
      location: "Istanbul",
      date: "Curated listing",
      description:
        "A demo cross-city evening connecting ferry views, mosque etiquette, tea stops, bazaars, and neighborhood food.",
      image:
        "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=600&q=84",
      imageAlt: "Istanbul skyline and Bosphorus at warm light",
    },
  ],
  vietnam: [
    {
      title: "Hoi An Lantern Town Food Walk",
      category: "Food / Culture",
      location: "Hoi An",
      date: "Curated listing",
      description:
        "A demo heritage-town evening through lantern streets, central Vietnamese dishes, tailoring lanes, and riverfront pacing.",
      image:
        "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=600&q=84",
      imageAlt: "Hoi An lantern street in Vietnam",
    },
  ],
};

export function getCuratedDemoEvents(countrySlug: string) {
  return curatedDemoEventsByCountrySlug[countrySlug] ?? [
    {
      title: "Local Culture Route",
      category: "Culture",
      location: "Local destination",
      date: "Curated listing",
      description:
        "A demo destination listing for local food, culture, and practical visitor context.",
      image: eventImage,
      imageAlt: "Scenic travel landscape",
    },
  ];
}
