export type JournalPost = {
  slug: string;
  category: string;
  title: string;
  destination: string;
  excerpt: string;
  author: string;
  readingTime: string;
  image: string;
  imageAlt: string;
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
    slug: "eight-days-between-volcanoes-and-black-sand",
    category: "Travel Story",
    title: "Eight Days Between Volcanoes and Black Sand",
    destination: "Iceland",
    excerpt:
      "A late-summer route through waterfalls, glacial roads, quiet pools, and the kind of landscape that makes every plan feel temporary.",
    author: "Nora Ellis",
    readingTime: "7 min read",
    image:
      "https://images.unsplash.com/photo-1504829857797-ddff29c27927?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Icelandic waterfall and green cliffs in summer light",
    body: [
      "The first thing Iceland teaches you is that distance is not measured cleanly in kilometers. It is measured in weather, light, gravel, and the number of times someone in the car asks to stop for one more photograph.",
      "We planned eight days, which sounded generous until the country started opening itself in layers: black sand, green valleys, hot pools, glacier edges, and small towns where dinner felt like a reward for simply arriving.",
      "The best days were not the fullest ones. They were the days with one strong idea, enough food in the car, and permission to let the route change when the sky did.",
    ],
    sections: [
      {
        heading: "The Road Sets the Rhythm",
        image:
          "https://images.unsplash.com/photo-1529963183134-61a90db47eaf?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Black sand coast with dramatic mountains in Iceland",
        content:
          "South Coast drives work best when they are allowed to breathe. Waterfalls, beaches, and glacier viewpoints sit close enough to tempt overplanning, but the real memory is often the pause between them.",
      },
      {
        heading: "What Stayed With Us",
        image:
          "https://images.unsplash.com/photo-1531168556467-80aace0d0144?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Remote northern coastline and cliffs",
        content:
          "The quietest places carried the strongest feeling: a pool at dusk, a roadside lunch, a cliff path where the wind made conversation unnecessary.",
      },
    ],
  },
  {
    slug: "the-quiet-side-of-kyoto",
    category: "City Guide",
    title: "The Quiet Side of Kyoto",
    destination: "Japan",
    excerpt:
      "Temple mornings, shaded lanes, tea houses, and the small etiquette details that make Kyoto feel softer when you slow down.",
    author: "Ren Sato",
    readingTime: "6 min read",
    image:
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Traditional Kyoto temple framed by seasonal foliage",
    body: [
      "Kyoto rewards early alarms. Before the lanes fill and the cameras rise, there is a quieter city made of sweeping, incense, bicycle bells, and shopkeepers lifting shutters.",
      "The trick is not to collect temples. It is to choose fewer places and leave room for the walk between them.",
      "A slow Kyoto day might hold one famous shrine, one small garden, one tea stop, and an evening along the river. That is enough.",
    ],
    sections: [
      {
        heading: "Start Before the City Speeds Up",
        image:
          "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Japanese shrine gates in soft light",
        content:
          "Arriving early is not only about avoiding crowds. It changes the way the city sounds, and it makes small rituals easier to notice.",
      },
      {
        heading: "Leave Space for Manners",
        image:
          "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Kyoto temple in warm seasonal light",
        content:
          "A little quiet goes a long way: step aside before looking at maps, keep residential lanes calm, and treat narrow streets as shared spaces.",
      },
    ],
  },
  {
    slug: "a-week-along-the-norwegian-coast",
    category: "Slow Travel",
    title: "A Week Along the Norwegian Coast",
    destination: "Norway",
    excerpt:
      "A slow coastal week of ferries, weather windows, harbor cafes, and long evenings where the sea becomes the itinerary.",
    author: "Leah Stone",
    readingTime: "8 min read",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Travelers overlooking a mountain valley at golden hour",
    body: [
      "Norway's coast is not a place to rush through. The ferry schedules, the weather, and the scale of the water all ask for a slower kind of attention.",
      "A week is enough to feel the rhythm if you stop measuring success by how far north you get.",
      "The best days were built around one crossing, one walk, one warm meal, and a view that kept changing after we thought we had understood it.",
    ],
    sections: [
      {
        heading: "Let Ferries Become the Plan",
        image:
          "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Mountain landscape under dramatic northern light",
        content:
          "Ferries are not only transport here. They are pauses, viewpoints, weather reports, and quiet rooms shared with locals going about their day.",
      },
      {
        heading: "Small Harbors, Long Evenings",
        image:
          "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Nordic harbor buildings near water",
        content:
          "The smaller stops are where the journey softens: a cafe window, a wet jacket drying, a harbor walk after dinner.",
      },
    ],
  },
  {
    slug: "finding-guatemala-beyond-the-tourist-trail",
    category: "Budget Travel",
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
      "Antigua made an easy beginning: coffee, courtyards, markets, and streets that turned ordinary errands into small discoveries.",
      "The lake asked for a slower week. Boats, villages, textiles, and weather all worked better when we stopped trying to make every day efficient.",
    ],
    sections: [
      {
        heading: "Value Lives in the Pace",
        image:
          "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Lake surrounded by mountains and villages",
        content:
          "Longer stays can lower costs, but they also make room for repetition: the same breakfast stall, the same boat dock, the same view in different weather.",
      },
      {
        heading: "Choose Trusted Logistics",
        image:
          "https://images.unsplash.com/photo-1512813195386-6cf811ad3542?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Ancient stone ruins surrounded by forest",
        content:
          "Saving money matters, but so does arriving with energy. For longer transfers, the best value was often the option that reduced stress.",
      },
    ],
  },
  {
    slug: "three-days-in-andalusia",
    category: "Local Culture",
    title: "Three Days in Andalusia",
    destination: "Spain",
    excerpt:
      "A compact southern route shaped by late meals, hot afternoons, neighborhood plazas, and the social rhythm of summer nights.",
    author: "Irene Morales",
    readingTime: "5 min read",
    image:
      "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Southern Spain architecture in golden light",
    body: [
      "Andalusia in summer is a lesson in timing. The day asks you to respect heat, shade, and the slow return of public life after sunset.",
      "Three days is not enough for the whole region, but it is enough to feel a pattern: morning streets, afternoon quiet, evening plazas, late dinner.",
      "The most memorable moments were not attractions so much as transitions: shutters opening, fans turning, tables filling, music escaping a doorway.",
    ],
    sections: [
      {
        heading: "Follow the Evening",
        image:
          "https://images.unsplash.com/photo-1558642084-fd07fae5282e?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Warm Spanish city street with festive lights",
        content:
          "When the heat lowers, the city returns to itself. That is when plazas, tapas bars, and long walks begin to make sense.",
      },
      {
        heading: "Let Small Rituals Lead",
        image:
          "https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?auto=format&fit=crop&w=1400&q=86",
        imageAlt: "Spanish city street glowing in warm summer light",
        content:
          "Coffee, shade, a short walk, a longer dinner: the region reveals itself through repetition more than speed.",
      },
    ],
  },
];

export function getJournalPost(slug: string) {
  return journalPosts.find((post) => post.slug === slug);
}
