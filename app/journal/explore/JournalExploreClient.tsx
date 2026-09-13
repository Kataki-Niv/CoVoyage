"use client";

import {
  ArrowLeft,
  Bookmark,
  BookOpen,
  Camera,
  Film,
  Heart,
  Lightbulb,
  PenLine,
  Share2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { API_BASE_URL } from "@/lib/api";
import {
  journalPosts,
  type JournalContentCategory,
  type JournalFormat,
  type JournalPost,
} from "@/lib/journalData";

type BlogResponse = {
  id?: string;
  title?: string;
  content?: string;
  excerpt?: string | null;
  tags?: string[];
  category?: "stories" | "guides" | "photos" | "videos" | "tips" | null;
  format?: "text" | "photo" | "video" | null;
  destination_name?: string | null;
  cover_image_url?: string | null;
  media_url?: string | null;
  status?: "draft" | "published";
  slug?: string;
  author_name?: string;
};

const typeIcons = {
  "Video Journal": Film,
  "Photo Journal": Camera,
  "Text Journal": PenLine,
  "Travel Guide": BookOpen,
  "Travel Tip": Lightbulb,
  "Community Story": PenLine,
};

const fallbackJournalImage =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=86";

function textExcerpt(content: string, limit = 180) {
  const normalizedContent = content.replace(/\s+/g, " ").trim();

  if (!normalizedContent) {
    return "A CoVoyage traveler shared a new story from the road.";
  }

  return normalizedContent.length > limit
    ? `${normalizedContent.slice(0, limit).trim()}...`
    : normalizedContent;
}

function estimateReadingTime(content: string) {
  const words = content.split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 220))} min read`;
}

function getBlogCategory(category: BlogResponse["category"]): {
  filter: "Stories" | "Guides" | "Tips";
  contentCategory: JournalContentCategory;
} {
  if (category === "guides") {
    return { filter: "Guides", contentCategory: "Guide" };
  }

  if (category === "tips") {
    return { filter: "Tips", contentCategory: "Tip" };
  }

  return { filter: "Stories", contentCategory: "Story" };
}

function getBlogFormat(blog: BlogResponse): JournalFormat {
  if (blog.format === "photo" || blog.category === "photos") {
    return "Photo";
  }

  if (blog.format === "video" || blog.category === "videos") {
    return "Video";
  }

  return "Text";
}

function getTypeForFormat(format: JournalFormat, category: JournalContentCategory) {
  if (format === "Photo") {
    return "Photo Journal" as const;
  }

  if (format === "Video") {
    return "Video Journal" as const;
  }

  if (category === "Guide") {
    return "Travel Guide" as const;
  }

  if (category === "Tip") {
    return "Travel Tip" as const;
  }

  return "Text Journal" as const;
}

function mapBlogToJournalPost(blog: BlogResponse, index: number): JournalPost {
  const title = blog.title?.trim() || "Untitled Journal";
  const content = blog.content?.trim() || "";
  const { filter, contentCategory } = getBlogCategory(blog.category);
  const format = getBlogFormat(blog);
  const image = blog.cover_image_url || fallbackJournalImage;

  return {
    slug: blog.slug?.trim() || blog.id || `journal-${index + 1}`,
    type: getTypeForFormat(format, contentCategory),
    filter,
    title,
    destination: blog.destination_name?.trim() || "CoVoyage Journal",
    format,
    contentCategory,
    excerpt: blog.excerpt?.trim() || textExcerpt(content),
    author: blog.author_name?.trim() || "CoVoyage Traveler",
    readingTime: estimateReadingTime(content || title),
    image,
    imageAlt: `${title} journal cover`,
    mediaUrl: blog.media_url || (format === "Video" ? image : undefined),
    body: content ? [content] : [textExcerpt(title)],
    sections: [],
  };
}

function mergePublishedBlogs(blogs: BlogResponse[]) {
  const postsBySlug = new Map(journalPosts.map((post) => [post.slug, post]));

  blogs
    .filter((blog) => blog.status === "published")
    .map(mapBlogToJournalPost)
    .forEach((post) => postsBySlug.set(post.slug, post));

  return Array.from(postsBySlug.values());
}

function orderPostsForEntry(posts: JournalPost[], initialJournal: string) {
  if (!initialJournal) {
    return posts;
  }

  const selectedIndex = posts.findIndex((post) => post.slug === initialJournal);

  if (selectedIndex < 0) {
    return posts;
  }

  return [
    posts[selectedIndex],
    ...posts.slice(selectedIndex + 1),
    ...posts.slice(0, selectedIndex),
  ];
}

function getContentCategory(post: JournalPost) {
  if (post.contentCategory) {
    return post.contentCategory;
  }

  if (post.filter === "Guides") {
    return "Guide";
  }

  if (post.filter === "Tips") {
    return "Tip";
  }

  return "Story";
}

function getFormat(post: JournalPost) {
  if (post.format) {
    return post.format;
  }

  if (post.filter === "Videos") {
    return "Video";
  }

  if (post.filter === "Photos") {
    return "Photo";
  }

  return "Text";
}

function getPostBody(post: JournalPost) {
  return post.body.join("\n\n");
}

export function JournalExploreClient({
  initialJournal,
}: {
  initialJournal: string;
}) {
  const [actionMessage, setActionMessage] = useState("");
  const [posts, setPosts] = useState<JournalPost[]>(journalPosts);

  useEffect(() => {
    let isActive = true;

    fetch(`${API_BASE_URL}/blogs`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : []))
      .then((blogs: BlogResponse[]) => {
        if (isActive && Array.isArray(blogs) && blogs.length) {
          setPosts(mergePublishedBlogs(blogs));
        }
      })
      .catch(() => {
        if (isActive) {
          setPosts(journalPosts);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const orderedPosts = useMemo(
    () => orderPostsForEntry(posts, initialJournal),
    [initialJournal, posts],
  );

  const sharePost = async (post: JournalPost) => {
    const url = `${window.location.origin}/journal/explore?journal=${post.slug}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setActionMessage("Journal link copied.");
      }
    } catch {
      setActionMessage("Share was not completed.");
    }
  };

  return (
    <main className="bg-[#050505] text-[#f8f4ea]">
      <div className="border-b border-white/10 bg-[#050505] px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <Link
              className="inline-flex h-10 items-center gap-2 rounded-full border border-white/18 px-4 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:border-white/45"
              href="/journal"
            >
              <ArrowLeft className="h-4 w-4" />
              Journals
            </Link>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/50">
              Explore
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex h-10 items-center justify-center rounded-full bg-[#f8f4ea] px-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#050505]">
                Explore
              </span>
              <Link
                className="inline-flex h-10 items-center justify-center rounded-full border border-white/18 px-4 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:border-white/45"
                href="/journal/create"
              >
                Create
              </Link>
              <Link
                className="inline-flex h-10 items-center justify-center rounded-full border border-white/18 px-4 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:border-white/45"
                href="/journal/my-journals"
              >
                My Journals
              </Link>
            </div>
          </div>
        </div>
        {actionMessage ? (
          <p className="mx-auto mt-3 max-w-7xl text-xs leading-6 text-white/46">
            {actionMessage}
          </p>
        ) : null}
      </div>

      <section className="h-[calc(100vh-9rem)] snap-y snap-mandatory overflow-y-auto scroll-smooth bg-[#050505]">
        {orderedPosts.length ? (
          orderedPosts.map((post) => (
            <JournalReelPost
              key={post.slug}
              post={post}
              onUnavailableAction={(label) =>
                setActionMessage(`${label} will be available when journal actions are connected.`)
              }
              onShare={sharePost}
            />
          ))
        ) : (
          <div className="grid h-full snap-start place-items-center px-5 text-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/46">
                No Journals
              </p>
              <p className="mt-4 font-serif text-4xl text-white">
                No journals are available yet.
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function JournalReelPost({
  post,
  onUnavailableAction,
  onShare,
}: {
  post: JournalPost;
  onUnavailableAction: (label: string) => void;
  onShare: (post: JournalPost) => void;
}) {
  const Icon = typeIcons[post.type];
  const format = getFormat(post);
  const category = getContentCategory(post);
  const actions = (
    <div className="mt-8 flex flex-wrap gap-3">
      <button
        className="inline-flex h-11 items-center gap-2 rounded-full border border-white/18 px-4 text-xs font-semibold uppercase tracking-[0.16em] text-white/58"
        onClick={() => onUnavailableAction("Like")}
        type="button"
      >
        <Heart className="h-4 w-4" />
        Like
      </button>
      <button
        className="inline-flex h-11 items-center gap-2 rounded-full border border-white/18 px-4 text-xs font-semibold uppercase tracking-[0.16em] text-white/58"
        onClick={() => onUnavailableAction("Save")}
        type="button"
      >
        <Bookmark className="h-4 w-4" />
        Save
      </button>
      <button
        className="inline-flex h-11 items-center gap-2 rounded-full bg-[#f8f4ea] px-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#050505]"
        onClick={() => onShare(post)}
        type="button"
      >
        <Share2 className="h-4 w-4" />
        Share
      </button>
    </div>
  );

  if (format === "Text") {
    return (
      <article className="relative flex min-h-full snap-start items-center overflow-hidden border-b border-white/10 bg-[#050505] px-5 py-10 sm:px-8 lg:py-14">
        <div className="absolute inset-x-0 top-0 h-px bg-white/12" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(248,244,234,0.08),transparent_28%),linear-gradient(135deg,rgba(248,244,234,0.03),transparent_45%)]" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[minmax(0,0.34fr)_minmax(0,0.66fr)] lg:items-center">
          <div>
            <div className="flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
              <span className="inline-flex items-center gap-2 border border-white/14 bg-white/[0.035] px-3 py-2">
                <Icon className="h-4 w-4" strokeWidth={1.5} />
                {format}
              </span>
              <span className="border border-white/14 bg-white/[0.035] px-3 py-2">
                {category}
              </span>
            </div>
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.28em] text-white/46">
              {post.destination}
            </p>
            <h1 className="mt-4 font-serif text-5xl leading-tight text-[#f8f4ea] sm:text-6xl lg:text-7xl">
              {post.title}
            </h1>
            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs uppercase tracking-[0.18em] text-white/46">
              <span>{post.author}</span>
              <span>{post.readingTime}</span>
            </div>
            {actions}
          </div>
          <div className="border-l border-white/14 pl-5 sm:pl-8 lg:pl-10">
            <p className="font-serif text-3xl leading-tight text-white sm:text-4xl">
              {post.excerpt}
            </p>
            <div className="mt-8 max-h-[42vh] overflow-hidden text-base leading-8 text-white/68">
              {getPostBody(post)}
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="relative grid min-h-full snap-start overflow-hidden border-b border-white/10 bg-[#050505] px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,0.58fr)_minmax(320px,0.42fr)] lg:items-center lg:gap-10 lg:py-10">
      <div className="relative min-h-[52vh] overflow-hidden border border-white/10 bg-[#111] lg:min-h-[76vh]">
        {format === "Video" ? (
          <video
            aria-label={`${post.title} video journal`}
            className="absolute inset-0 h-full w-full object-cover"
            controls
            muted
            playsInline
            preload="metadata"
            poster={post.image}
            src={post.mediaUrl || "/videos/petra-journal.mp4"}
          />
        ) : (
          <Image
            alt={post.imageAlt}
            className="absolute inset-0 h-full w-full object-cover"
            fill
            sizes="(min-width: 1024px) 58vw, 100vw"
            src={post.image}
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.02),rgba(5,5,5,0.64))]" />
        <div className="absolute left-5 top-5 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
          <span className="inline-flex items-center gap-2 bg-black/42 px-3 py-2 backdrop-blur-xl">
            <Icon className="h-4 w-4" strokeWidth={1.5} />
            {format}
          </span>
          <span className="bg-black/42 px-3 py-2 backdrop-blur-xl">{category}</span>
        </div>
      </div>

      <div className="relative z-10 flex min-h-[38vh] flex-col justify-center py-8 lg:min-h-0 lg:py-0">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/46">
          {post.destination}
        </p>
        <h1 className="mt-4 font-serif text-5xl leading-tight text-[#f8f4ea] sm:text-6xl">
          {post.title}
        </h1>
        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs uppercase tracking-[0.18em] text-white/46">
          <span>{post.author}</span>
          <span>{category}</span>
          <span>{format}</span>
          <span>{post.readingTime}</span>
        </div>
        <p className="mt-6 text-base leading-8 text-white/68">{post.excerpt}</p>
        {actions}
      </div>
    </article>
  );
}
