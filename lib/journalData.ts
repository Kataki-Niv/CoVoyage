export type JournalPostType =
  | "Video Journal"
  | "Photo Journal"
  | "Text Journal"
  | "Travel Guide"
  | "Travel Tip"
  | "Community Story";

export type JournalFilter = "Stories" | "Guides" | "Photos" | "Videos" | "Tips";

export type JournalPost = {
  slug: string;
  type: JournalPostType;
  filter: JournalFilter;
  title: string;
  destination: string;
  excerpt: string;
  author: string;
  readingTime: string;
  image: string;
  imageAlt: string;
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
    type: "Video Journal",
    filter: "Videos",
    title: "The People We Met in Kyoto",
    destination: "Japan / Kyoto",
    excerpt:
      "A short video journal about temple mornings, side-street conversations, shared meals, and the strangers who made Kyoto feel personal.",
    author: "Maya Chen",
    readingTime: "4 min watch",
    image:
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Traditional Kyoto temple framed by seasonal foliage",
    featured: true,
    body: [
      "Kyoto became less like a destination and more like a chain of small introductions: a baker before opening, a couple sketching in a garden, a guide who changed our route because the light was better elsewhere.",
      "The video is not about collecting temples. It is about the people who softened the city and gave our days a human shape.",
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
    slug: "a-quiet-morning-in-kyoto",
    type: "Photo Journal",
    filter: "Photos",
    title: "A Quiet Morning in Kyoto",
    destination: "Japan / Kyoto",
    excerpt:
      "A photo-led walk through empty lanes, soft temple light, early bicycles, and the hush before the city fills.",
    author: "Ren Sato",
    readingTime: "3 min view",
    image:
      "https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Quiet Kyoto morning street",
    body: [
      "Kyoto rewards early alarms. Before the lanes fill and the cameras rise, there is a quieter city made of sweeping, incense, bicycle bells, and shopkeepers lifting shutters.",
      "The trick is not to collect temples. It is to choose fewer places and leave room for the walk between them.",
    ],
    sections: [
      {
        heading: "Before the Day Speeds Up",
        image:
          "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Kyoto temple in warm seasonal light",
        content:
          "Arriving early is not only about avoiding crowds. It changes the way the city sounds.",
      },
    ],
  },
  {
    slug: "sometimes-the-best-part-of-travelling-is-getting-lost",
    type: "Text Journal",
    filter: "Stories",
    title: "Sometimes the best part of travelling is getting lost.",
    destination: "Japan / Kyoto",
    excerpt:
      "A short reflection from a traveler who found a hidden tea house by following a lantern-lit side street.",
    author: "Ari Nair",
    readingTime: "2 min read",
    image:
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1800&q=80",
    imageAlt: "Kyoto street at dusk with warm lantern light",
    body: [
      "We were not lost in any dramatic way. We had a phone, a map, and enough battery. But we had stopped trying to be efficient, which is its own kind of getting lost.",
      "The tea house was down a side street we only noticed because we missed a turn.",
    ],
    sections: [
      {
        heading: "A Better Wrong Turn",
        image:
          "https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Quiet Kyoto street",
        content:
          "The memory stayed because it was not optimized: rain, lanterns, a handwritten menu, and nowhere else to be.",
      },
    ],
  },
  {
    slug: "eight-days-between-volcanoes-and-black-sand",
    type: "Community Story",
    filter: "Stories",
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
    type: "Travel Guide",
    filter: "Guides",
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
    type: "Community Story",
    filter: "Stories",
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
    slug: "what-to-carry-for-japan",
    type: "Travel Tip",
    filter: "Tips",
    title: "Packing Guide: What to Carry for Japan",
    destination: "Japan",
    excerpt:
      "A practical packing note for temple days, convenience-store meals, humid weather, and rail-heavy routes.",
    author: "CoVoyage Desk",
    readingTime: "4 min read",
    image:
      "https://images.unsplash.com/photo-1512692723619-8b3e68365c9c?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Travel bag and notebook on a bed",
    body: ["Pack light, leave room, and prioritize shoes that can handle long station walks."],
    sections: [],
  },
  {
    slug: "best-time-to-visit-kyoto",
    type: "Travel Tip",
    filter: "Tips",
    title: "Best Time to Visit Kyoto",
    destination: "Japan / Kyoto",
    excerpt:
      "A short seasonal note on spring blossoms, autumn color, summer heat, and quieter shoulder-season mornings.",
    author: "CoVoyage Desk",
    readingTime: "3 min read",
    image:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Kyoto shrine gates in soft light",
    body: ["Kyoto changes sharply by season, so comfort depends as much on timing as route design."],
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
