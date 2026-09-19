export type JournalCategory = "Stories" | "Guides" | "Media" | "Tips";
export type JournalFormat = "Text" | "Photo" | "Video";

export type JournalPost = {
  slug: string;
  category: JournalCategory;
  title: string;
  destination: string;
  format?: JournalFormat;
  excerpt: string;
  author: string;
  readingTime: string;
  image: string;
  imageAlt: string;
  mediaUrl?: string;
  featured?: boolean;
  body: string[];
  sections: {
    heading: string;
    image: string;
    imageAlt: string;
    content: string;
  }[];
};

export const journalPosts: JournalPost[] = [
  {
    slug: "the-people-we-met-in-kyoto",
    category: "Media",
    format: "Photo",
    title: "The People We Met in Kyoto",
    destination: "Japan / Kyoto",
    excerpt:
      "A photo-led journal about temple mornings, side-street conversations, shared meals, and the strangers who made Kyoto feel personal.",
    author: "Maya Chen",
    readingTime: "4 min view",
    image:
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Traditional Kyoto temple framed by seasonal foliage",
    featured: true,
    body: [
      "Kyoto became less like a destination and more like a chain of small introductions: a baker before opening, a couple sketching in a garden, a guide who changed our route because the light was better elsewhere.",
      "The journal is not about collecting temples. It is about the people who softened the city and gave our days a human shape.",
    ],
    sections: [
      {
        heading: "The City Opened Through People",
        image:
          "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Japanese shrine gates in soft light",
        content:
          "A few conversations changed the route more than any map did: a tea recommendation, a quieter lane, a reminder to slow down.",
      },
    ],
  },
  {
    slug: "venice-before-the-day-trippers",
    category: "Media",
    format: "Photo",
    title: "Venice Before the Day-Trippers",
    destination: "Italy / Venice",
    excerpt:
      "A photo-led walk through quiet canals, market setup, early vaporetto rides, and the hush before Venice fills.",
    author: "Ren Moretti",
    readingTime: "3 min view",
    image:
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Venice canal with gondolas and old buildings",
    body: [
      "Venice rewards early alarms. Before the bridges fill and the cameras rise, there is a quieter city made of water deliveries, market crates, bells, and footsteps on stone.",
      "The trick is not to collect every landmark. It is to choose fewer turns and leave room for the walk between them.",
    ],
    sections: [
      {
        heading: "Before the Water Traffic Builds",
        image:
          "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Quiet Venice canal and historic buildings in soft light",
        content:
          "Arriving early is not only about avoiding crowds. It changes the way the city sounds.",
      },
    ],
  },
  {
    slug: "sometimes-the-best-part-of-paris-is-getting-lost",
    category: "Stories",
    format: "Text",
    title: "Sometimes the best part of Paris is getting lost.",
    destination: "France / Paris",
    excerpt:
      "A short reflection from a traveler who found a neighborhood bakery by following a rain-glossed side street.",
    author: "Ari Laurent",
    readingTime: "2 min read",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Paris skyline with the Eiffel Tower",
    body: [
      "We were not lost in any dramatic way. We had a phone, a map, and enough battery. But we had stopped trying to be efficient, which is its own kind of getting lost.",
      "The bakery was down a side street we only noticed because we missed a turn.",
    ],
    sections: [
      {
        heading: "A Better Wrong Turn",
        image:
          "https://images.unsplash.com/photo-1520939817895-060bdaf4fe1b?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Paris street cafe and neighborhood tables",
        content:
          "The memory stayed because it was not optimized: rain, a handwritten menu, warm bread, and nowhere else to be.",
      },
    ],
  },
  {
    slug: "eight-days-between-volcanoes-and-black-sand",
    category: "Stories",
    format: "Text",
    title: "Eight Days Between Volcanoes and Black Sand",
    destination: "Iceland",
    excerpt:
      "A late-summer route through waterfalls, glacial roads, quiet pools, and landscapes that made every plan feel temporary.",
    author: "Nora Ellis",
    readingTime: "7 min read",
    image:
      "https://images.unsplash.com/photo-1504829857797-ddff29c27927?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Icelandic waterfall and green cliffs in summer light",
    body: [
      "The first thing Iceland teaches you is that distance is measured in weather, light, gravel, and the number of times someone asks to stop for one more photograph.",
      "The best days were not the fullest ones. They were the days with one strong idea and permission to let the route change.",
    ],
    sections: [
      {
        heading: "The Road Sets the Rhythm",
        image:
          "https://images.unsplash.com/photo-1529963183134-61a90db47eaf?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Black sand coast with dramatic mountains in Iceland",
        content:
          "South Coast drives work best when they are allowed to breathe.",
      },
    ],
  },
  {
    slug: "finding-guatemala-beyond-the-tourist-trail",
    category: "Guides",
    format: "Text",
    title: "Finding Guatemala Beyond the Tourist Trail",
    destination: "Guatemala",
    excerpt:
      "Markets, lake villages, guesthouses, and long shuttle days that prove value travel can still feel rich and specific.",
    author: "Mateo Silva",
    readingTime: "7 min read",
    image:
      "https://images.unsplash.com/photo-1602120012884-6aa678fa79c7?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Antigua Guatemala archway and cobblestone street",
    body: [
      "Budget travel in Guatemala does not have to mean thinning the experience. Often it means staying longer, walking more, eating locally, and choosing the route with fewer forced upgrades.",
    ],
    sections: [
      {
        heading: "Value Lives in the Pace",
        image:
          "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Lake surrounded by mountains and villages",
        content:
          "Longer stays can lower costs, but they also make room for repetition.",
      },
    ],
  },
  {
    slug: "three-days-in-andalusia",
    category: "Stories",
    format: "Text",
    title: "Three Days in Andalusia",
    destination: "Spain",
    excerpt:
      "A compact southern route shaped by late meals, hot afternoons, neighborhood plazas, and summer nights.",
    author: "Irene Morales",
    readingTime: "5 min read",
    image:
      "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Southern Spain architecture in golden light",
    body: [
      "Andalusia in summer is a lesson in timing. The day asks you to respect heat, shade, and the slow return of public life after sunset.",
    ],
    sections: [
      {
        heading: "Follow the Evening",
        image:
          "https://images.unsplash.com/photo-1558642084-fd07fae5282e?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Warm Spanish city street with festive lights",
        content:
          "When the heat lowers, the city returns to itself.",
      },
    ],
  },
  {
    slug: "what-to-carry-for-portugal",
    category: "Tips",
    format: "Text",
    title: "Packing Guide: What to Carry for Portugal",
    destination: "Portugal",
    excerpt:
      "A practical packing note for tiled streets, Atlantic wind, hill walks, beach trains, and long seafood evenings.",
    author: "CoVoyage Desk",
    readingTime: "4 min read",
    image:
      "https://images.unsplash.com/photo-1513735492246-483525079686?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Lisbon rooftops and colorful buildings in Portugal",
    body: ["Pack light layers, comfortable shoes for stone hills, sun protection, and room for market finds."],
    sections: [],
  },
  {
    slug: "best-time-to-visit-marrakech",
    category: "Tips",
    format: "Text",
    title: "Best Time to Visit Marrakech",
    destination: "Morocco / Marrakech",
    excerpt:
      "A short seasonal note on medina pacing, garden breaks, warm evenings, and cooler shoulder-season mornings.",
    author: "CoVoyage Desk",
    readingTime: "3 min read",
    image:
      "https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Marrakech medina street and warm architecture",
    body: ["Marrakech is easiest when days are paced around cooler mornings, shaded afternoons, and unhurried evenings."],
    sections: [],
  },
];

export const landingJournalPosts = journalPosts.slice(0, 3);
export const featuredJournalPost = journalPosts[0];
export const communityJournalPosts = journalPosts.slice(3, 6);
export const insightJournalPosts = journalPosts.slice(6);

export function getJournalPost(slug: string) {
  return journalPosts.find((post) => post.slug === slug);
}
