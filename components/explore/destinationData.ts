export type StaticDestinationKey = "iceland" | "guatemala" | "spain" | "japan";
export type DestinationKey = StaticDestinationKey | (string & {});

export type DestinationType = "featured" | "searched";

export type SnapshotItem = {
  label: string;
  value: string;
};

export type CurrencyInfo = {
  name: string;
  code: string;
};

export type DailyBudgetInfo = {
  value: string;
  note: string;
};

export type InfoSection = {
  title: string;
  content: string;
};

export type LocalPhrase = {
  english: string;
  local: string;
  pronunciation?: string;
  usageNote?: string;
};

export type JourneyFact = {
  label: string;
  value: string;
};

export type JourneyPlace = {
  number: string;
  placeSlug?: string;
  name: string;
  region: string;
  story: string;
  image: string;
  imageAlt: string;
  align: "left" | "right";
  facts: JourneyFact[];
  localVibe: string[];
  communityTips: CommunityTip[];
};

export type CommunityTip = {
  quote: string;
  location: string;
  traveler: string;
  rating: string;
};

export type VibeNote = {
  title: string;
  body: string;
};

export type DestinationEvent = {
  title: string;
  category: string;
  location: string;
  date: string;
  description: string;
  image: string;
  imageAlt: string;
};

export type DestinationData = {
  key: DestinationKey;
  destinationType: DestinationType;
  country: string;
  flag: string;
  month: string;
  year: string;
  featuredCategory: string;
  currency: CurrencyInfo;
  averageDailyBudget: DailyBudgetInfo;
  heroTitle: string;
  intro: string;
  heroImage: string;
  heroImageAlt: string;
  snapshot: SnapshotItem[];
  journeyTitle: string;
  journeyEyebrow?: string;
  journeyIntro: string;
  journeyPlaces: JourneyPlace[];
  vibeNotes: VibeNote[];
  events: DestinationEvent[];
  itineraryFields: SnapshotItem[];
  goodToKnow: InfoSection[];
  localPhrasesTitle: string;
  localPhrases: LocalPhrase[];
};

export const destinations: Record<StaticDestinationKey, DestinationData> = {
  iceland: {
    key: "iceland",
    destinationType: "featured",
    country: "Iceland",
    flag: "IS",
    month: "August",
    year: "2026",
    featuredCategory: "Scenic Beauty",
    currency: {
      name: "Icelandic króna",
      code: "ISK",
    },
    averageDailyBudget: {
      value: "ISK 22,000–39,500",
      note: "Accommodation, meals & local transport",
    },
    heroTitle: "Scenic Beauty in Long Summer Light",
    intro:
      "Iceland is featured for August 2026 because its dramatic scenery is unusually reachable: long daylight, open summer routes, Highlands access, and landscapes that move from black sand to glaciers to moss-green valleys in a single journey.",
    heroImage:
      "https://images.unsplash.com/photo-1504829857797-ddff29c27927?auto=format&fit=crop&w=1800&q=88",
    heroImageAlt: "Icelandic waterfall and green cliffs in summer light",
    snapshot: [
      { label: "Currency", value: "Icelandic króna (ISK)" },
      { label: "Language", value: "Icelandic, English widely used" },
      { label: "Visa / Entry", value: "Schengen rules apply" },
      { label: "Daily Budget", value: "ISK 22,000–39,500" },
      { label: "Trip Style", value: "Road trip, hiking, scenery" },
      { label: "Best Month", value: "August for access and daylight" },
      { label: "Emergency", value: "112" },
      { label: "Time Zone", value: "GMT, UTC +0" },
    ],
    journeyTitle: "Highlands to Black-Sand Coast",
    journeyIntro:
      "A four-part scenic route built around the reason Iceland matters in August: the country feels open, vivid, and road-ready.",
    journeyPlaces: [
      {
        number: "01",
        name: "Landmannalaugar",
        region: "Highlands Color",
        story:
          "A gateway to rhyolite mountains, steaming geothermal ground, and colorful volcanic terrain that is most practical to reach in the short summer access window.",
        image:
          "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Colorful mountain landscape under soft daylight",
        align: "left",
        facts: [
          { label: "Why Visit", value: "Rhyolite mountains and geothermal scenery" },
          { label: "Time Required", value: "1 full day or overnight" },
          { label: "Local Experience", value: "Highlands hiking and hot-spring stops" },
          { label: "August Note", value: "Better access than shoulder seasons" },
        ],
        localVibe: [
          "Check road conditions before committing.",
          "Pack layers even on sunny days.",
          "Stay on marked trails to protect fragile terrain.",
        ],
        communityTips: [
          {
            quote:
              "If you are going into the Highlands, treat the drive as part of the experience and leave room for weather delays.",
            location: "Landmannalaugar",
            traveler: "Jon, local guide",
            rating: "4.8",
          },
        ],
      },
      {
        number: "02",
        name: "Porsmork",
        region: "Glacial Valley",
        story:
          "A dramatic valley framed by glaciers and mountains, where summer hiking turns Iceland's scale into something you can feel on foot.",
        image:
          "https://i.pinimg.com/1200x/8b/23/11/8b2311edf1ff0293d24082602777a7eb.jpg",
        imageAlt: "Mount Fuji reflected in a lake at sunset",
        align: "right",
        facts: [
          { label: "Why Visit", value: "Valleys, glaciers, and trail views" },
          { label: "Time Required", value: "1-2 days" },
          { label: "Local Experience", value: "Guided hiking or hut-based exploring" },
          { label: "August Note", value: "Lush summer landscapes and longer days" },
        ],
        localVibe: [
          "Use proper transport for river crossings.",
          "Do not underestimate weather changes.",
          "Book guided options early in August.",
        ],
        communityTips: [
          {
            quote:
              "Book a proper Highlands bus or guided transfer. The river crossings are not casual rental-car territory.",
            location: "Porsmork",
            traveler: "Katrin, hiking host",
            rating: "4.9",
          },
        ],
      },
      {
        number: "03",
        name: "South Coast",
        region: "Iconic Drama",
        story:
          "Waterfalls, glaciers, black-sand beaches, and volcanic landscapes create the classic Iceland visual sequence, especially cinematic in late summer light.",
        image:
          "https://images.unsplash.com/photo-1529963183134-61a90db47eaf?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Icelandic black sand coast with dramatic mountains",
        align: "left",
        facts: [
          { label: "Why Visit", value: "Waterfalls, glaciers, and black sand" },
          { label: "Time Required", value: "2-4 days" },
          { label: "Local Experience", value: "Glacier walks and coastal drives" },
          { label: "August Note", value: "Long days make scenic pacing easier" },
        ],
        localVibe: [
          "Stay back from sneaker waves.",
          "Start early at famous waterfalls.",
          "Use pullouts instead of stopping on roads.",
        ],
        communityTips: [
          {
            quote:
              "Build fewer stops into each day. The South Coast rewards slow looking more than checkpoint travel.",
            location: "South Coast",
            traveler: "Mara, landscape photographer",
            rating: "4.9",
          },
        ],
      },
      {
        number: "04",
        name: "Westfjords",
        region: "Remote Coast",
        story:
          "Fjords, cliffs, and winding coastal roads make this the quieter scenic chapter, ideal for travelers who want space and drama without constant crowds.",
        image:
          "https://images.unsplash.com/photo-1531168556467-80aace0d0144?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Remote northern coastline and cliffs",
        align: "right",
        facts: [
          { label: "Why Visit", value: "Cliffs, fjords, and remote roads" },
          { label: "Time Required", value: "3-5 days" },
          { label: "Local Experience", value: "Small villages and coastal viewpoints" },
          { label: "August Note", value: "Best chance for flexible road travel" },
        ],
        localVibe: [
          "Keep fuel and food stops planned.",
          "Give rural roads more time than maps suggest.",
          "Respect bird cliffs and viewing boundaries.",
        ],
        communityTips: [
          {
            quote:
              "Pack lunch before remote drives. Small detours get expensive fast, and cafes are not always close.",
            location: "Westfjords",
            traveler: "Eli, road tripper",
            rating: "4.7",
          },
        ],
      },
    ],
    vibeNotes: [
      { title: "Culture", body: "Independence, weather awareness, and respect for nature shape everyday travel etiquette." },
      { title: "Etiquette", body: "Never step onto moss, ignore closures, or treat private farm roads as scenic shortcuts." },
      { title: "Communication", body: "English is widely spoken, but direct, calm communication is appreciated." },
      { title: "Visitors Get Wrong", body: "Distances, wind, and road conditions often matter more than the raw mileage." },
    ],
    events: [
      {
        title: "Total Solar Eclipse",
        category: "Astronomy / Major Event",
        location: "Western Iceland / path of totality",
        date: "12 August 2026",
        description:
          "A total solar eclipse crosses western Iceland on 12 August 2026. The path of totality includes areas such as the Westfjords, Snæfellsnes, Reykjanes and Reykjavík. Plan travel in advance, expect increased traffic around popular viewing areas, and use certified eclipse glasses outside totality.",
        image:
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=84",
        imageAlt: "Dramatic Icelandic landscape under atmospheric sky",
      },
      {
        title: "Reykjavík Culture Night",
        category: "Culture",
        location: "Reykjavík",
        date: "August 2026",
        description:
          "A citywide cultural evening with music, museums, food, and neighborhood events.",
        image:
          "https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=600&q=84",
        imageAlt: "Reykjavik city buildings under soft northern light",
      },
      {
        title: "Highlands Summer Hiking",
        category: "Nature / Adventure",
        location: "Icelandic Highlands",
        date: "August 2026",
        description:
          "A practical late-summer window for guided Highlands hikes and scenic routes.",
        image:
          "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=84",
        imageAlt: "Colorful mountain landscape in summer light",
      },
      {
        title: "Puffin Coast Watching",
        category: "Wildlife",
        location: "Icelandic coastal areas",
        date: "Early August 2026",
        description:
          "A seasonal coastal experience framed as a prototype until exact timing is verified.",
        image:
          "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?auto=format&fit=crop&w=600&q=84",
        imageAlt: "Coastal bird perched near the sea",
      },
    ],
    itineraryFields: [
      { label: "Budget", value: "$2600" },
      { label: "Days", value: "8" },
      { label: "Interests", value: "Scenery, hiking, road trip" },
    ],
    goodToKnow: [
      {
        title: "F-roads aren't normal roads",
        content:
          "Iceland's Highland F-roads are a different category of road from the normal routes around the country. Some are rough, some involve river crossings, and different roads have different vehicle requirements. For the Iceland Highlands, travelers should check whether their specific vehicle is suitable for the specific F-road they intend to use. This is particularly relevant to Landmannalaugar and Porsmork.",
      },
      {
        title: "A river crossing is a real decision",
        content:
          "Some Highland routes involve unbridged river crossings. River conditions can change and a crossing that appears manageable may not be safe. Iceland SafeTravel warns that vehicle insurance does not cover damage sustained while crossing rivers. Practical takeaway: If you are unsure about a crossing, do not attempt it.",
      },
      {
        title: "That empty landscape isn't a road",
        content:
          "Motor vehicles must stay on designated roads and tracks. Driving off-road across Iceland's natural terrain is prohibited, with limited legal exceptions under specific conditions. This is particularly relevant in the Highlands, where open landscapes can appear driveable even when they are not legal roads.",
      },
      {
        title: "Don't assume you can fly a drone anywhere",
        content:
          "Iceland has formal drone rules and restrictions around airports, sensitive areas and protected areas. Some individual attractions and protected areas can impose additional restrictions. Travelers should check the official Iceland drone map and local rules before flying.",
      },
      {
        title: "The swimming pool is part of local life",
        content:
          "Icelandic public swimming pools are not merely tourist attractions. They are everyday social spaces. Before entering the pool, swimmers are expected to shower thoroughly with soap, without their swimsuit. The hot tubs are also important social spaces and part of everyday Icelandic swimming-pool culture.",
      },
      {
        title: "You probably won't need much cash",
        content:
          "Card and contactless payments are widely accepted in Iceland, while foreign currencies are rarely accepted. Tipping is not generally expected.",
      },
      {
        title: "Check medications and CBD before you fly",
        content:
          "Iceland has specific restrictions on importing narcotic and addictive substances. Cannabis cannot simply be brought into Iceland because it is legal or medically permitted in the traveler's home country. CBD products can also be subject to product-specific restrictions. Travelers should check Iceland's official import rules before packing medications or CBD products.",
      },
    ],
    localPhrasesTitle: "A Little Icelandic",
    localPhrases: [
      { english: "Hello", local: "Hall\u00f3 / H\u00e6" },
      { english: "Thank you", local: "Takk" },
      { english: "Goodbye", local: "Bless" },
      { english: "Yes", local: "J\u00e1" },
      { english: "No", local: "Nei" },
      { english: "Excuse me / Sorry", local: "Afsaki\u00f0" },
    ],
  },
  guatemala: {
    key: "guatemala",
    destinationType: "featured",
    country: "Guatemala",
    flag: "GT",
    month: "August",
    year: "2026",
    featuredCategory: "Budget-Friendly",
    currency: {
      name: "Guatemalan quetzal",
      code: "GTQ",
    },
    averageDailyBudget: {
      value: "GTQ 230–460",
      note: "Accommodation, meals & local transport",
    },
    heroTitle: "Value-Rich Culture and Landscape",
    intro:
      "Guatemala is featured for August 2026 because it can deliver a layered trip through colonial streets, volcanic lakes, jungle ruins, and local food at a gentler cost than many peak-summer destinations.",
    heroImage:
      "https://images.unsplash.com/photo-1602120012884-6aa678fa79c7?auto=format&fit=crop&w=1800&q=88",
    heroImageAlt: "Antigua Guatemala archway and cobblestone street",
    snapshot: [
      { label: "Currency", value: "Guatemalan quetzal (GTQ)" },
      { label: "Language", value: "Spanish, Mayan languages" },
      { label: "Visa / Entry", value: "Varies by passport" },
      { label: "Daily Budget", value: "GTQ 230–460" },
      { label: "Trip Style", value: "Culture, lakes, nature" },
      { label: "Best Month", value: "August value planning" },
      { label: "Emergency", value: "110 / 120 / 122" },
      { label: "Time Zone", value: "CST, UTC -6" },
    ],
    journeyTitle: "Colonial Streets to Jungle Ruins",
    journeyIntro:
      "A value-oriented route where each stop adds a different kind of richness without turning the trip into a luxury itinerary.",
    journeyPlaces: [
      {
        number: "01",
        name: "Antigua Guatemala",
        region: "Historic Base",
        story:
          "A walkable colonial city with affordable guesthouses, food, coffee, markets, and cultural texture close enough to explore without constant transfers.",
        image:
          "https://images.unsplash.com/photo-1602120012884-6aa678fa79c7?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Antigua Guatemala archway and cobblestone street",
        align: "left",
        facts: [
          { label: "Why Visit", value: "Historic streets, food, and cultural access" },
          { label: "Time Required", value: "2-3 days" },
          { label: "Local Food", value: "Pepian, tamales, coffee, street snacks" },
          { label: "Value Note", value: "Good range of stays and walkable days" },
        ],
        localVibe: [
          "Stay near the center if you want to walk more.",
          "Markets are best with small cash.",
          "Coffee tours can be good value if booked locally.",
        ],
        communityTips: [
          {
            quote:
              "Antigua is easiest when you walk, snack, rest, then walk again.",
            location: "Antigua",
            traveler: "Mateo, food host",
            rating: "4.9",
          },
        ],
      },
      {
        number: "02",
        name: "Lake Atitl\u00e1n",
        region: "Village Lake",
        story:
          "Volcano views, boat-linked villages, and lakefront stays give travelers a scenic base that can stay affordable with slower pacing.",
        image:
          "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Lake surrounded by mountains and villages",
        align: "right",
        facts: [
          { label: "Why Visit", value: "Lake scenery and village culture" },
          { label: "Time Required", value: "3-4 days" },
          { label: "Local Experience", value: "Boat rides, weaving, cafes, viewpoints" },
          { label: "Value Note", value: "Longer stays can lower daily cost" },
        ],
        localVibe: [
          "Choose the village based on your pace.",
          "Ask boat prices before boarding.",
          "Support local workshops directly where possible.",
        ],
        communityTips: [
          {
            quote:
              "Stay in a lake village that matches your rhythm, not just the most famous one.",
            location: "Lake Atitl\u00e1n",
            traveler: "Sofia, slow traveler",
            rating: "4.8",
          },
        ],
      },
      {
        number: "03",
        name: "Semuc Champey",
        region: "Nature Pools",
        story:
          "Turquoise pools, caves, waterfalls, and jungle surroundings create a big outdoor experience that can still fit a value-focused route.",
        image:
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Turquoise natural pools and lush greenery",
        align: "left",
        facts: [
          { label: "Why Visit", value: "Pools, waterfalls, and outdoor adventure" },
          { label: "Time Required", value: "2-3 days including travel" },
          { label: "Local Experience", value: "Guided pools and cave trips" },
          { label: "Value Note", value: "Transport time is the main cost" },
        ],
        localVibe: [
          "Expect long travel days.",
          "Bring water shoes and dry bags.",
          "Book transport with trusted operators.",
        ],
        communityTips: [
          {
            quote:
              "Do not underestimate the travel time to Semuc Champey. Add buffer.",
            location: "Lanqu\u00edn",
            traveler: "Nora, backpacker",
            rating: "4.6",
          },
        ],
      },
      {
        number: "04",
        name: "Flores / Tikal",
        region: "History Base",
        story:
          "Flores works as a colorful, practical base for Tikal, where archaeology, jungle, and early starts become the cultural finale.",
        image:
          "https://images.unsplash.com/photo-1512813195386-6cf811ad3542?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Ancient stone ruins surrounded by forest",
        align: "right",
        facts: [
          { label: "Why Visit", value: "Maya history and jungle ruins" },
          { label: "Time Required", value: "2-3 days" },
          { label: "Local Experience", value: "Sunrise ruins tour and island evenings" },
          { label: "Value Note", value: "Flores makes logistics easier" },
        ],
        localVibe: [
          "Start early for cooler ruins visits.",
          "Use licensed guides for context.",
          "Keep extra cash for park and transport fees.",
        ],
        communityTips: [
          {
            quote:
              "Stay in Flores the night before Tikal so the early start feels manageable.",
            location: "Flores / Tikal",
            traveler: "Luis, history traveler",
            rating: "4.7",
          },
        ],
      },
    ],
    vibeNotes: [
      { title: "Culture", body: "Hospitality is warm, but local rhythms can be slower and more relationship-based than schedule-based." },
      { title: "Etiquette", body: "Ask before photographing people, especially in markets or Indigenous communities." },
      { title: "Communication", body: "A few Spanish greetings help a lot. Patience matters during transport and bargaining." },
      { title: "Visitors Get Wrong", body: "Cheapest is not always best value; trusted transport and central stays can save stress." },
    ],
    events: [
      { title: "Antigua Food Walk", category: "Food", location: "Antigua", date: "August 2026", description: "A low-key route through markets, bakeries, coffee, and local kitchens.", image: "https://images.unsplash.com/photo-1602120012884-6aa678fa79c7?auto=format&fit=crop&w=600&q=84", imageAlt: "Antigua Guatemala archway and street" },
      { title: "Lake Village Market Day", category: "Community", location: "Lake Atitl\u00e1n", date: "August 2026", description: "A village-based day for textiles, food, and slow local browsing.", image: "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=600&q=84", imageAlt: "Lake surrounded by mountains" },
      { title: "Tikal Sunrise Visit", category: "History", location: "Tikal", date: "August 2026", description: "An early archaeological experience designed around cooler hours and richer context.", image: "https://images.unsplash.com/photo-1512813195386-6cf811ad3542?auto=format&fit=crop&w=600&q=84", imageAlt: "Ancient stone ruins in forest" },
    ],
    itineraryFields: [
      { label: "Budget", value: "$900" },
      { label: "Days", value: "10" },
      { label: "Interests", value: "Culture, value, nature" },
    ],
    goodToKnow: [
      {
        title: "Getting Around",
        content:
          "Shared shuttles, tourist vans, and buses are common between Antigua, Lake Atitl\u00e1n, Lanqu\u00edn, Flores, and Tikal. Routes can take longer than expected, so avoid stacking big transfers back to back.",
      },
      {
        title: "Weather & Conditions",
        content:
          "August falls in the rainy season, so mornings often work better for walking, viewpoints, ruins, and lake crossings. Keep plans flexible for afternoon rain.",
      },
      {
        title: "Money & Payments",
        content:
          "Guatemala uses the quetzal. Cards work in many hotels and restaurants, but markets, boats, small eateries, and rural transport often require cash in smaller bills.",
      },
      {
        title: "Connectivity",
        content:
          "Local SIMs and eSIMs are useful, but signal can weaken around mountain roads, lake villages, and jungle routes. Save accommodation addresses and shuttle details offline.",
      },
      {
        title: "What to Pack",
        content:
          "Pack rain protection, breathable layers, comfortable shoes for cobblestones and trails, insect repellent, a small cash pouch, and a dry bag for lake or cave days.",
      },
      {
        title: "Photographs need permission",
        content:
          "Ask before photographing people, especially in Indigenous communities and markets. Some textiles, ceremonies and family-run stalls are part of living culture, not staged attractions.",
      },
      {
        title: "Long transfers are real travel days",
        content:
          "Routes to Semuc Champey, Flores and Tikal can take longer than expected. Avoid planning tight same-day activities after major transfers.",
      },
    ],
    localPhrasesTitle: "A Little Spanish",
    localPhrases: [
      { english: "Hello", local: "Hola" },
      { english: "Thank you", local: "Gracias" },
      { english: "Please", local: "Por favor" },
      { english: "Goodbye", local: "Adi\u00f3s" },
      { english: "Yes", local: "S\u00ed" },
      { english: "No", local: "No" },
      { english: "Excuse me / Sorry", local: "Disculpe / Lo siento" },
    ],
  },
  spain: {
    key: "spain",
    destinationType: "featured",
    country: "Spain",
    flag: "ES",
    month: "August",
    year: "2026",
    featuredCategory: "Major Festival / Event",
    currency: {
      name: "Euro",
      code: "EUR",
    },
    averageDailyBudget: {
      value: "EUR 87–173",
      note: "Accommodation, meals & local transport",
    },
    heroTitle: "Festival Energy Worth Planning Around",
    intro:
      "Spain is featured for August 2026 because the month has a clear cultural hook: La Tomatina in Bu\u00f1ol on 26 August, plus late-summer festival energy across Valencia, M\u00e1laga, and Andalusia.",
    heroImage:
      "https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?auto=format&fit=crop&w=1800&q=88",
    heroImageAlt: "Spanish city street glowing in warm summer light",
    snapshot: [
      { label: "Currency", value: "Euro (EUR)" },
      { label: "Language", value: "Spanish, regional languages" },
      { label: "Visa / Entry", value: "Schengen rules apply" },
      { label: "Daily Budget", value: "EUR 87–173" },
      { label: "Trip Style", value: "Festivals, cities, food" },
      { label: "Best Month", value: "August for events" },
      { label: "Emergency", value: "112" },
      { label: "Time Zone", value: "CET/CEST, UTC +2 in summer" },
    ],
    journeyTitle: "Festival Route Through Late Summer Spain",
    journeyIntro:
      "A month-aware route anchored by La Tomatina, then widened into Valencia, M\u00e1laga, and Andalusian celebration culture.",
    journeyPlaces: [
      {
        number: "01",
        name: "Bu\u00f1ol",
        region: "La Tomatina",
        story:
          "The anchor event: La Tomatina on 26 August 2026. It is messy, crowded, specific, and exactly the kind of reason to plan Spain this month.",
        image:
          "https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Crowded summer street festival scene",
        align: "left",
        facts: [
          { label: "Why Visit", value: "La Tomatina festival energy" },
          { label: "Time Required", value: "1 event day plus buffer" },
          { label: "Local Experience", value: "Festival crowds, music, and street rituals" },
          { label: "August Note", value: "26 August 2026 is the key date" },
        ],
        localVibe: [
          "Book transport before festival day.",
          "Wear clothes you can part with.",
          "Carry only waterproof essentials.",
        ],
        communityTips: [
          {
            quote:
              "Arrive in Bu\u00f1ol early and know your return plan before the tomato chaos starts.",
            location: "Bu\u00f1ol",
            traveler: "Clara, festival regular",
            rating: "4.9",
          },
        ],
      },
      {
        number: "02",
        name: "Valencia",
        region: "Event Base",
        story:
          "Valencia gives the Bu\u00f1ol trip a wider rhythm: food markets, Mediterranean evenings, beach breaks, and practical access to the festival.",
        image:
          "https://images.unsplash.com/photo-1606768666853-403c90a981ad?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Valencia architecture and reflecting water",
        align: "right",
        facts: [
          { label: "Why Visit", value: "Best base for Bu\u00f1ol and city life" },
          { label: "Time Required", value: "3-4 days" },
          { label: "Local Food", value: "Paella, horchata, market snacks" },
          { label: "August Note", value: "Plan around heat and event logistics" },
        ],
        localVibe: [
          "Eat late; evenings carry the city.",
          "Reserve festival transfers early.",
          "Use mornings for markets and architecture.",
        ],
        communityTips: [
          {
            quote:
              "Use Valencia as your calm base, then treat La Tomatina as the wild day trip.",
            location: "Valencia",
            traveler: "Diego, local host",
            rating: "4.8",
          },
        ],
      },
      {
        number: "03",
        name: "M\u00e1laga",
        region: "Feria Atmosphere",
        story:
          "Feria de M\u00e1laga gives Spain a second August celebration: music, street energy, local dress, and coastal summer atmosphere.",
        image:
          "https://images.unsplash.com/photo-1558642084-fd07fae5282e?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Warm Spanish city street with festive lights",
        align: "left",
        facts: [
          { label: "Why Visit", value: "Feria de M\u00e1laga and coastal festival mood" },
          { label: "Time Required", value: "2-3 days" },
          { label: "Local Experience", value: "Evening celebrations and tapas routes" },
          { label: "August Note", value: "Festival timing shapes the city" },
        ],
        localVibe: [
          "Pace yourself in daytime heat.",
          "Dress comfortably but respectfully.",
          "Expect nights to run late.",
        ],
        communityTips: [
          {
            quote:
              "For M\u00e1laga feria, daytime and night feel like two different events. Try both.",
            location: "M\u00e1laga",
            traveler: "Irene, culture guide",
            rating: "4.7",
          },
        ],
      },
      {
        number: "04",
        name: "Andalusia",
        region: "Regional Traditions",
        story:
          "Beyond one city, Andalusia adds local celebrations, music, food, and regional traditions that make August feel culturally specific.",
        image:
          "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Southern Spain architecture in golden light",
        align: "right",
        facts: [
          { label: "Why Visit", value: "Regional festivals and summer traditions" },
          { label: "Time Required", value: "4-7 days" },
          { label: "Local Food", value: "Tapas, gazpacho, seafood, local wines" },
          { label: "August Note", value: "Culture is strongest after sunset" },
        ],
        localVibe: [
          "Plan around siesta hours.",
          "Hydrate and slow the midday pace.",
          "Look for smaller local fiestas too.",
        ],
        communityTips: [
          {
            quote:
              "Ask locals which neighborhood celebration feels active that week; the smaller ones can be warmer.",
            location: "Andalusia",
            traveler: "Rafa, regional guide",
            rating: "4.6",
          },
        ],
      },
    ],
    vibeNotes: [
      { title: "Culture", body: "Late meals, public life, and local celebration rhythms are central to August travel." },
      { title: "Etiquette", body: "Do not block narrow streets for photos during crowded events; move with the flow." },
      { title: "Communication", body: "Basic Spanish greetings help, and regional pride matters in conversation." },
      { title: "Visitors Get Wrong", body: "August is not just beach season. It is also event logistics, heat management, and late nights." },
    ],
    events: [
      { title: "La Tomatina", category: "Festival", location: "Bu\u00f1ol", date: "26 August 2026", description: "Spain's headline August event: a ticketed tomato festival requiring transport and practical planning.", image: "https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?auto=format&fit=crop&w=600&q=84", imageAlt: "Crowded summer street festival scene" },
      { title: "Feria de M\u00e1laga", category: "Festival", location: "M\u00e1laga", date: "August 2026", description: "A major city celebration with day fairs, music, food, dancing, and evening atmosphere.", image: "https://images.unsplash.com/photo-1558642084-fd07fae5282e?auto=format&fit=crop&w=600&q=84", imageAlt: "Warm Spanish city street with festive lights" },
      { title: "Valencia Food Evening", category: "Food", location: "Valencia", date: "August 2026", description: "A slower night built around market culture, paella traditions, horchata, and local neighborhoods.", image: "https://images.unsplash.com/photo-1606768666853-403c90a981ad?auto=format&fit=crop&w=600&q=84", imageAlt: "Valencia architecture and reflecting water" },
    ],
    itineraryFields: [
      { label: "Budget", value: "$1800" },
      { label: "Days", value: "9" },
      { label: "Interests", value: "Festivals, food, cities" },
    ],
    goodToKnow: [
      {
        title: "Getting Around",
        content:
          "Trains are useful between major cities, while festival day trips like Bu\u00f1ol require advance planning for timed transport, crowds, and return routes.",
      },
      {
        title: "Weather & Conditions",
        content:
          "August is hot in much of Spain, especially inland and in Andalusia. Plan sightseeing early, rest midday, and save festival or social energy for evening.",
      },
      {
        title: "Money & Payments",
        content:
          "Spain uses the euro. Cards are common, but small cash can still be useful for kiosks, local buses, market snacks, lockers, or event-day extras.",
      },
      {
        title: "Connectivity",
        content:
          "Mobile coverage is generally strong in cities and towns. For festival days, download tickets, maps, and return transport details in case networks get crowded.",
      },
      {
        title: "What to Pack",
        content:
          "Bring breathable clothing, sun protection, refillable water, comfortable shoes, a secure small bag, and event-specific clothes you do not mind getting messy.",
      },
      {
        title: "Festival logistics matter",
        content:
          "La Tomatina and August fairs are not casual walk-up experiences. Book transport and accommodation early, keep valuables secure, and know the return route before crowds build.",
      },
      {
        title: "Evenings carry the rhythm",
        content:
          "Meals, terraces, fairs and street life often run later than visitors expect, especially during hot months. Build downtime into the afternoon and save energy for night.",
      },
    ],
    localPhrasesTitle: "A Little Spanish",
    localPhrases: [
      { english: "Hello", local: "Hola" },
      { english: "Thank you", local: "Gracias" },
      { english: "Please", local: "Por favor" },
      { english: "Goodbye", local: "Adi\u00f3s" },
      { english: "Yes", local: "S\u00ed" },
      { english: "No", local: "No" },
      { english: "Excuse me / Sorry", local: "Perd\u00f3n / Lo siento" },
    ],
  },
  japan: {
    key: "japan",
    destinationType: "searched",
    country: "Japan",
    flag: "JP",
    month: "August",
    year: "2026",
    featuredCategory: "August Travel Context",
    currency: {
      name: "Japanese yen",
      code: "JPY",
    },
    averageDailyBudget: {
      value: "JPY 18,000\u201333,000",
      note: "Accommodation, meals & local transport",
    },
    heroTitle: "Planning to Visit Japan This Month?",
    intro:
      "You searched for Japan, so this August 2026 guide focuses on places, rhythms, and practical local context worth considering for late-summer travel.",
    heroImage:
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1800&q=88",
    heroImageAlt: "Traditional Japanese temple framed by warm seasonal foliage",
    snapshot: [
      { label: "Currency", value: "Japanese yen (JPY)" },
      { label: "Language", value: "Japanese" },
      { label: "Visa / Entry", value: "Varies by passport" },
      { label: "Daily Budget", value: "JPY 18,000\u201333,000" },
      { label: "Trip Style", value: "Cities, food, culture, nature" },
      { label: "Best Month", value: "August for festivals and summer routes" },
      { label: "Emergency", value: "110 / 119" },
      { label: "Time Zone", value: "JST, UTC +9" },
    ],
    journeyTitle: "Places to Consider in August",
    journeyEyebrow: "Places To Explore This Month",
    journeyIntro:
      "A searched-destination route for Japan in August: not a universal best-of list, but four places that give late-summer travelers a strong mix of city energy, food culture, temples, and northern air.",
    journeyPlaces: [
      {
        number: "01",
        name: "Tokyo",
        region: "Capital Energy",
        story:
          "Tokyo gives August travelers dense neighborhoods, evening food streets, museums, shopping arcades, and reliable transit when summer heat makes pacing important.",
        image:
          "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Tokyo skyline and city lights at dusk",
        align: "left",
        facts: [
          { label: "Why Visit", value: "Neighborhoods, food halls, museums, and city rhythm" },
          { label: "Time Required", value: "3-5 days" },
          { label: "Local Experience", value: "Depachika food halls, train stations, night streets" },
          { label: "August Note", value: "Plan indoor breaks and evening wandering" },
        ],
        localVibe: [
          "Carry a small towel in summer.",
          "Stand aside before checking maps.",
          "Use convenience stores without underestimating them.",
        ],
        communityTips: [
          {
            quote:
              "In August, build Tokyo days around one main neighborhood, then let air-conditioned stations and food halls do some of the work.",
            location: "Tokyo",
            traveler: "Aiko, city host",
            rating: "4.8",
          },
        ],
      },
      {
        number: "02",
        name: "Kyoto",
        region: "Temple Mornings",
        story:
          "Kyoto is best approached gently in August: early temples, shaded lanes, river evenings, and cultural details that reward slower timing.",
        image:
          "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Traditional Kyoto temple framed by seasonal foliage",
        align: "right",
        facts: [
          { label: "Why Visit", value: "Temples, tea culture, old streets, and rituals" },
          { label: "Time Required", value: "3-4 days" },
          { label: "Local Experience", value: "Morning shrines, matcha stops, riverside evenings" },
          { label: "August Note", value: "Start early and keep midday flexible" },
        ],
        localVibe: [
          "Keep voices low on residential lanes.",
          "Carry cash for smaller tea houses.",
          "Avoid blocking narrow streets for photos.",
        ],
        communityTips: [
          {
            quote:
              "Go to famous temples early, then spend the hottest hours in smaller museums, cafes, or station food floors.",
            location: "Kyoto",
            traveler: "Ren, culture guide",
            rating: "4.9",
          },
        ],
      },
      {
        number: "03",
        name: "Osaka",
        region: "Food Street Glow",
        story:
          "Osaka adds generous evening energy, counter food, canal lights, and a more relaxed urban rhythm after structured sightseeing days.",
        image:
          "https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Osaka city street glowing with signs at night",
        align: "left",
        facts: [
          { label: "Why Visit", value: "Street food, nightlife, and warm city energy" },
          { label: "Time Required", value: "2-3 days" },
          { label: "Local Experience", value: "Takoyaki, kushikatsu, counters, canal walks" },
          { label: "August Note", value: "Evenings carry the city best" },
        ],
        localVibe: [
          "Side streets can be calmer than Dotonbori.",
          "Counter seats are often friendlier than they look.",
          "Check escalator standing habits locally.",
        ],
        communityTips: [
          {
            quote:
              "Save Osaka for nights if you can. The city feels easier once the lights are on and the heat drops.",
            location: "Osaka",
            traveler: "Mika, food host",
            rating: "4.8",
          },
        ],
      },
      {
        number: "04",
        name: "Hokkaido",
        region: "Northern Summer",
        story:
          "Hokkaido offers a cooler-feeling counterpoint to Japan's major cities, with flower fields, open roads, seafood, dairy, and spacious summer landscapes.",
        image:
          "https://images.unsplash.com/photo-1532236204992-f5e85c024202?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Wide Hokkaido landscape with seasonal fields and mountains",
        align: "right",
        facts: [
          { label: "Why Visit", value: "Open scenery, food, flower fields, and slower drives" },
          { label: "Time Required", value: "4-6 days" },
          { label: "Local Experience", value: "Furano fields, seafood markets, hot springs" },
          { label: "August Note", value: "A strong summer option for northern scenery" },
        ],
        localVibe: [
          "Distances are bigger than they appear.",
          "Reserve popular countryside transport early.",
          "Bring layers for cooler evenings.",
        ],
        communityTips: [
          {
            quote:
              "Do not plan Hokkaido like a quick city hop. Give the roads and scenery real time.",
            location: "Hokkaido",
            traveler: "Daichi, road tripper",
            rating: "4.7",
          },
        ],
      },
    ],
    vibeNotes: [
      { title: "Etiquette", body: "Queue carefully, keep train calls quiet, and treat shared spaces as calm public rooms." },
      { title: "Culture", body: "Seasonality matters, from summer festivals and food to small details in shops and stations." },
      { title: "What Travelers Miss", body: "Convenience stores, station food halls, neighborhood bathhouses, and local arcades often reveal daily life." },
      { title: "Useful Behavior", body: "Carry a small towel, sort trash patiently, keep coins handy, and use simple greetings." },
    ],
    events: [
      {
        title: "Sumida River Fireworks",
        category: "Summer Festival",
        location: "Tokyo",
        date: "August 2026",
        description:
          "A summer-night fireworks experience in Tokyo, presented as prototype timing until exact event details are verified.",
        image:
          "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=84",
        imageAlt: "Tokyo city lights at night",
      },
      {
        title: "Kyoto Evening Lantern Walk",
        category: "Culture",
        location: "Kyoto",
        date: "August 2026",
        description:
          "A low-key cultural evening built around lantern-lit lanes, temple etiquette, and seasonal sweets.",
        image:
          "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=600&q=84",
        imageAlt: "Traditional Kyoto temple in warm evening light",
      },
      {
        title: "Osaka Food Market Crawl",
        category: "Food",
        location: "Osaka",
        date: "August 2026",
        description:
          "A late-day food route through takoyaki, kushikatsu, and bright counter-style neighborhoods.",
        image:
          "https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=600&q=84",
        imageAlt: "Osaka night street filled with signs and food market energy",
      },
      {
        title: "Hokkaido Lavender Fields",
        category: "Nature",
        location: "Furano / Hokkaido",
        date: "August 2026",
        description:
          "A northern summer countryside experience framed around flower fields, dairy treats, and open views.",
        image:
          "https://images.unsplash.com/photo-1532236204992-f5e85c024202?auto=format&fit=crop&w=600&q=84",
        imageAlt: "Hokkaido seasonal fields and open northern scenery",
      },
    ],
    itineraryFields: [
      { label: "Budget", value: "JPY 220,000" },
      { label: "Days", value: "10" },
      { label: "Interests", value: "Food, culture, cities, nature" },
    ],
    goodToKnow: [
      {
        title: "August heat changes the pace",
        content:
          "Japan can be hot and humid in August, especially in major cities. Plan temples, markets, and outdoor walks early or late, then use museums, cafes, stations, and food halls for midday recovery.",
      },
      {
        title: "Cash still helps",
        content:
          "Cards are common in many places, but smaller restaurants, shrine shops, lockers, older inns, and rural stops may still be easier with cash. Keep some yen in smaller notes and coins.",
      },
      {
        title: "Train etiquette is quiet",
        content:
          "On trains, keep phone calls off, lower voices, queue carefully, and move away from doors when boarding crowds build. Small habits shape the local feel of travel.",
      },
      {
        title: "Trash bins can be limited",
        content:
          "Public trash bins are not always easy to find. Carry a small bag for wrappers and bottles until you reach a station, convenience store, hotel, or appropriate recycling point.",
      },
      {
        title: "Reservations matter in busy areas",
        content:
          "Popular restaurants, museums, trains, and countryside stays can book up during summer travel periods. Reserve key experiences early and leave flexible space around them.",
      },
      {
        title: "Shoes and indoor manners",
        content:
          "Some temples, homes, ryokan, and traditional restaurants require shoes off. Wear socks you are comfortable being seen in and watch where others place footwear.",
      },
      {
        title: "Simple phrases go far",
        content:
          "Japanese is the main language. English support is common in major travel areas, but greetings, thanks, and polite apologies make everyday interactions smoother.",
      },
    ],
    localPhrasesTitle: "A Little Japanese",
    localPhrases: [
      {
        english: "Hello",
        local: "\u3053\u3093\u306b\u3061\u306f",
        pronunciation: "Konnichiwa",
      },
      {
        english: "Thank you",
        local: "\u3042\u308a\u304c\u3068\u3046",
        pronunciation: "Arigat\u014d",
      },
      {
        english: "Excuse me / Sorry",
        local: "\u3059\u307f\u307e\u305b\u3093",
        pronunciation: "Sumimasen",
      },
      {
        english: "Yes",
        local: "\u306f\u3044",
        pronunciation: "Hai",
      },
      {
        english: "No",
        local: "\u3044\u3048",
        pronunciation: "Iie",
      },
      {
        english: "Goodbye",
        local: "\u3055\u3088\u3046\u306a\u3089",
        pronunciation: "Say\u014dnara",
      },
    ],
  },
};
