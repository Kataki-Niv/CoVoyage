"use client";

import {
  ArrowRight,
  BookOpen,
  Camera,
  Check,
  Lightbulb,
  PenLine,
  Plus,
  Send,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  ApiError,
  getValidAuthToken,
  resolveMediaUrl,
} from "@/lib/api";
import {
  createBlog,
  deleteBlog,
  updateBlog,
  uploadJournalMedia,
  type Blog,
  type BlogPayload,
  type JournalBackendCategory,
  type JournalBackendFormat,
  type JournalStatus,
} from "@/lib/journalApi";
import {
  communityJournalPosts,
  featuredJournalPost,
  insightJournalPosts,
  journalPosts,
  type JournalCategory,
  type JournalPost,
} from "@/lib/journalData";

const filters = ["All", "Stories", "Guides", "Media", "Tips"] as const;
type ActiveFilter = (typeof filters)[number];
type CreateContentCategory = JournalCategory;
type CreateFormat = "Text" | "Photo" | "Video";
type MediaSelection = {
  file: File;
  previewUrl: string;
};

const maxImageBytes = 10 * 1024 * 1024;
const maxVideoBytes = 100 * 1024 * 1024;
const acceptedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const acceptedVideoTypes = ["video/mp4", "video/webm", "video/quicktime"];

type JournalFormState = {
  title: string;
  destination: string;
  category: CreateContentCategory;
  format: CreateFormat;
  excerpt: string;
  content: string;
  tags: string;
  coverImageUrl: string;
  mediaUrl: string;
};

const emptyJournalForm: JournalFormState = {
  title: "",
  destination: "",
  category: "Stories",
  format: "Text",
  excerpt: "",
  content: "",
  tags: "",
  coverImageUrl: "",
  mediaUrl: "",
};

function toBackendCategory(category: CreateContentCategory): JournalBackendCategory {
  if (category === "Guides") {
    return "guides";
  }

  if (category === "Media") {
    return "media";
  }

  if (category === "Tips") {
    return "tips";
  }

  return "stories";
}

function toBackendFormat(format: CreateFormat): JournalBackendFormat {
  if (format === "Photo") {
    return "photo";
  }

  if (format === "Video") {
    return "video";
  }

  return "text";
}

function fromBackendCategory(category: Blog["category"]): CreateContentCategory {
  if (category === "guides") {
    return "Guides";
  }

  if (category === "media" || category === "photos" || category === "videos") {
    return "Media";
  }

  if (category === "tips") {
    return "Tips";
  }

  return "Stories";
}

function fromBackendFormat(blog: Blog): CreateFormat {
  if (blog.format === "photo" || blog.category === "photos") {
    return "Photo";
  }

  if (blog.format === "video" || blog.category === "videos") {
    return "Video";
  }

  return "Text";
}

function formFromBlog(blog: Blog): JournalFormState {
  return {
    title: blog.title,
    destination: blog.destination_name || "",
    category: fromBackendCategory(blog.category),
    format: fromBackendFormat(blog),
    excerpt: blog.excerpt || "",
    content: blog.content,
    tags: blog.tags.join(", "),
    coverImageUrl: blog.cover_image_url || "",
    mediaUrl: blog.media_url || "",
  };
}

function buildBlogPayload(form: JournalFormState, status: JournalStatus): BlogPayload {
  const title = form.title.trim();
  const content = form.content.trim();
  const excerpt = form.excerpt.trim();
  const tags = form.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  return {
    title,
    content,
    excerpt: excerpt || null,
    tags,
    category: toBackendCategory(form.category),
    format: toBackendFormat(form.format),
    destination_name: form.destination.trim() || null,
    cover_image_url: form.coverImageUrl.trim() || null,
    media_url: form.format === "Video" ? form.mediaUrl.trim() || null : null,
    status,
  };
}

function formatFileSize(size: number) {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(size / 1024))} KB`;
}

const typeIcons = {
  Stories: PenLine,
  Guides: BookOpen,
  Media: Camera,
  Tips: Lightbulb,
};

export function JournalPageClient() {
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);

  useEffect(() => {
    if (window.location.hash === "#create-post") {
      const timer = window.setTimeout(() => setIsModalOpen(true), 0);

      return () => window.clearTimeout(timer);
    }
  }, []);

  const filteredPosts = useMemo(() => {
    if (activeFilter === "All") {
      return journalPosts;
    }

    return journalPosts.filter((post) => post.category === activeFilter);
  }, [activeFilter]);

  const handleJournalSaved = (blog: Blog) => {
    setEditingBlog(blog);
  };

  return (
    <>
      <main className="bg-[#050505] text-[#f8f4ea]">
        <JournalHeader />
        <FeaturedJournal post={featuredJournalPost} />
        <section className="border-y border-white/10 bg-[#101010] px-5 py-4 sm:px-8">
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto">
            {filters.map((filter) => (
              <button
                className={
                  activeFilter === filter
                    ? "h-10 shrink-0 rounded-full bg-[#f8f4ea] px-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#050505]"
                    : "h-10 shrink-0 rounded-full border border-white/14 px-5 text-xs font-semibold uppercase tracking-[0.18em] text-white/58 transition-colors hover:border-white/40 hover:text-white"
                }
                key={filter}
                onClick={() => setActiveFilter(filter)}
                type="button"
              >
                {filter}
              </button>
            ))}
          </div>
        </section>
        <TravelerGallery posts={filteredPosts} />
        <CommunitySection />
        <InsightsSection />
        <ShareJourneySection />
      </main>
      {isModalOpen ? (
        <CreatePostModal
          onClose={() => setIsModalOpen(false)}
          onSaved={handleJournalSaved}
          initialBlog={editingBlog}
        />
      ) : null}
    </>
  );
}

function JournalHeader() {
  return (
    <section className="bg-[#050505] px-5 pb-3 pt-8 text-white sm:px-8 lg:pb-4 lg:pt-10">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 text-left">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/50">
            CoVoyage Journals
          </p>
        </div>
        <div className="flex flex-col items-start gap-3">
          <div className="flex flex-wrap justify-start gap-3">
            <Link
              className="inline-flex h-11 items-center justify-center rounded-full border border-white/18 px-5 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:border-white/45"
              href="/journal/explore"
            >
              Explore
            </Link>
            <Link
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#f8f4ea] px-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#050505] transition-colors hover:bg-white"
              href="/journal/create"
            >
              Create
            </Link>
            <Link
              className="inline-flex h-11 items-center justify-center rounded-full border border-white/18 px-5 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:border-white/45"
              href="/journal/my-journals"
            >
              My Journals
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function MyJournalsPanel({
  error,
  isLoading,
  journals,
  onClose,
  onDelete,
  onEdit,
  onRefresh,
  showClose = true,
}: {
  error: string;
  isLoading: boolean;
  journals: Blog[];
  onClose: () => void;
  onDelete: (blog: Blog) => void;
  onEdit: (blog: Blog) => void;
  onRefresh: () => void;
  showClose?: boolean;
}) {
  const published = journals.filter((journal) => journal.status === "published");
  const drafts = journals.filter((journal) => journal.status === "draft");

  return (
    <section className="border-b border-white/10 bg-[#0b0b0b] px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/46">
              My Journals
            </p>
            <h2 className="mt-3 font-serif text-4xl text-[#f8f4ea]">
              Published work and drafts
            </h2>
          </div>
          {showClose ? (
            <button
              className="inline-flex h-10 w-fit items-center justify-center rounded-full border border-white/18 px-4 text-xs font-semibold uppercase tracking-[0.16em] text-white/60 transition-colors hover:border-white/45 hover:text-white"
              onClick={onClose}
              type="button"
            >
              Close
            </button>
          ) : null}
        </div>
        {isLoading ? (
          <p className="mt-6 text-sm text-white/54">Loading your journals...</p>
        ) : null}
        {error ? (
          <p className="mt-6 text-sm text-white/54" role="status">
            {error}
          </p>
        ) : null}
        {!isLoading && !error ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <JournalCollection
              emptyMessage="No published journals yet."
              journals={published}
              label="Published"
              onDelete={onDelete}
              onEdit={onEdit}
              onRefresh={onRefresh}
            />
            <JournalCollection
              emptyMessage="No drafts yet."
              journals={drafts}
              label="Drafts"
              onDelete={onDelete}
              onEdit={onEdit}
              onRefresh={onRefresh}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function JournalCollection({
  emptyMessage,
  journals,
  label,
  onDelete,
  onEdit,
  onRefresh,
}: {
  emptyMessage: string;
  journals: Blog[];
  label: string;
  onDelete: (blog: Blog) => void;
  onEdit: (blog: Blog) => void;
  onRefresh: () => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/46">
        {label}
      </p>
      <div className="mt-4 space-y-3">
        {journals.length ? (
          journals.map((journal) => (
            <MyJournalCard
              journal={journal}
              key={journal.id}
              onDelete={onDelete}
              onEdit={onEdit}
              onRefresh={onRefresh}
            />
          ))
        ) : (
          <p className="border border-white/10 bg-[#141414] p-5 text-sm text-white/50">
            {emptyMessage}
          </p>
        )}
      </div>
    </div>
  );
}

function MyJournalCard({
  journal,
  onDelete,
  onEdit,
  onRefresh,
}: {
  journal: Blog;
  onDelete: (blog: Blog) => void;
  onEdit: (blog: Blog) => void;
  onRefresh: () => void;
}) {
  const [message, setMessage] = useState("");
  const category = fromBackendCategory(journal.category);

  const handleDelete = async () => {
    const token = getValidAuthToken();

    if (!token) {
      setMessage("Log in again to delete this journal.");
      return;
    }

    try {
      await deleteBlog(journal.id, token);
      onDelete(journal);
    } catch (error) {
      setMessage(
        error instanceof ApiError ? error.detail : "Unable to delete this journal.",
      );
    }
  };

  const handlePublish = async () => {
    const token = getValidAuthToken();

    if (!token) {
      setMessage("Log in again to publish this draft.");
      return;
    }

    try {
      await updateBlog(journal.id, { status: "published" }, token);
      onRefresh();
    } catch (error) {
      setMessage(
        error instanceof ApiError ? error.detail : "Unable to publish this draft.",
      );
    }
  };

  return (
    <article className="border border-white/10 bg-[#151515] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/46">
            {category} / {journal.status}
          </p>
          <h3 className="mt-3 font-serif text-2xl leading-tight text-[#f8f4ea]">
            {journal.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-white/56">
            {journal.destination_name || "No destination set"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="h-9 rounded-full border border-white/14 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-white/62 hover:border-white/40 hover:text-white"
            onClick={() => onEdit(journal)}
            type="button"
          >
            {journal.status === "draft" ? "Continue Editing" : "Edit"}
          </button>
          {journal.status === "draft" ? (
            <button
              className="h-9 rounded-full bg-[#f8f4ea] px-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#050505]"
              onClick={handlePublish}
              type="button"
            >
              Publish
            </button>
          ) : null}
          <button
            className="h-9 rounded-full border border-white/14 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-white/62 hover:border-white/40 hover:text-white"
            onClick={handleDelete}
            type="button"
          >
            Delete
          </button>
        </div>
      </div>
      {message ? (
        <p className="mt-4 text-xs leading-5 text-white/50" role="status">
          {message}
        </p>
      ) : null}
    </article>
  );
}

function FeaturedJournal({ post }: { post: JournalPost }) {
  const Icon = typeIcons[post.category];

  return (
    <section className="px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.38fr_0.62fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/46">
              Featured Journal
            </p>
            <h2 className="mt-4 font-serif text-5xl leading-tight text-[#f8f4ea]">
              {post.title}
            </h2>
            <p className="mt-5 text-base leading-8 text-white/64">
              {post.excerpt}
            </p>
            <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-xs uppercase tracking-[0.18em] text-white/46">
              <span>{post.category}</span>
              <span>{post.destination}</span>
              <span>{post.readingTime}</span>
            </div>
          </div>
          <Link
            className="group relative min-h-[360px] overflow-hidden bg-[#151515] sm:min-h-[520px]"
            href={`/journal/explore?journal=${post.slug}`}
          >
            <Image
              alt={post.imageAlt}
              className="object-cover transition duration-700 group-hover:scale-105"
              fill
              sizes="(min-width: 1024px) 62vw, calc(100vw - 40px)"
              src={post.image}
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(28,25,23,0.06),rgba(28,25,23,0.62))]" />
            <div className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/55 bg-black/38 text-white backdrop-blur-xl">
              <Icon className="h-8 w-8" strokeWidth={1.4} />
            </div>
            <span className="absolute bottom-6 left-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-white">
              View Journal
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function TravelerGallery({ posts }: { posts: JournalPost[] }) {
  return (
    <section className="px-5 pb-16 pt-12 sm:px-8 lg:pb-24 lg:pt-16" id="explore">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/46">
              Traveler&apos;s Gallery
            </p>
            <h2 className="mt-3 font-serif text-5xl text-[#f8f4ea]">
              Field notes, films, photos, and guides
            </h2>
          </div>
        </div>
        <div className="grid auto-rows-[minmax(280px,auto)] gap-5 lg:grid-cols-12">
          {posts.map((post, index) => (
            <JournalCard key={post.slug} post={post} variant={index % 5} />
          ))}
        </div>
      </div>
    </section>
  );
}

function JournalCard({ post, variant }: { post: JournalPost; variant: number }) {
  const Icon = typeIcons[post.category];
  const wide = variant === 0 || variant === 3;

  return (
    <article
      className={
        wide
          ? "group relative scroll-mt-28 overflow-hidden border border-white/10 bg-[#151515] lg:col-span-7"
          : "group relative scroll-mt-28 overflow-hidden border border-white/10 bg-[#151515] lg:col-span-5"
      }
      id={post.slug}
    >
      <Image
        alt={post.imageAlt}
        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
        fill
        sizes={wide ? "(min-width: 1024px) 58vw, 100vw" : "(min-width: 1024px) 42vw, 100vw"}
        src={post.image}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(28,25,23,0.12),rgba(28,25,23,0.78)),linear-gradient(90deg,rgba(28,25,23,0.64),rgba(28,25,23,0.18))]" />
      <div className="relative z-10 flex min-h-[360px] flex-col justify-between p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-white/76">
          <span className="inline-flex items-center gap-2">
            <Icon className="h-4 w-4" strokeWidth={1.5} />
            {post.category}
          </span>
          <span>{post.destination}</span>
        </div>
        <div className="max-w-xl">
          <h3 className="font-serif text-4xl leading-tight sm:text-5xl">
            {post.title}
          </h3>
          <p className="mt-4 text-sm leading-7 text-white/78">{post.excerpt}</p>
          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs uppercase tracking-[0.18em] text-white/62">
            <span>{post.author}</span>
            <span>{post.readingTime}</span>
          </div>
          <Link
            className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
            href={`/journal/explore?journal=${post.slug}`}
          >
            View Journal
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function CommunitySection() {
  return (
    <section className="bg-[#101010] px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/46">
          From Travelers, For Travelers
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {communityJournalPosts.map((post) => (
            <Link
              className="group block border border-white/10 bg-[#171717] p-6 transition-colors hover:bg-[#1f1f1f]"
              href={`/journal/explore?journal=${post.slug}`}
              key={post.slug}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/46">
                {post.destination}
              </p>
              <h3 className="mt-4 font-serif text-3xl leading-tight text-[#f8f4ea]">
                {post.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-white/60">
                {post.excerpt}
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/58 group-hover:text-white">
                Read note
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function InsightsSection() {
  const planningNotes = [
    {
      title: "Reading the Chilean Lake District Weather Window",
      destination: "Chile",
      readingTime: "3 min read",
      description:
        "A lightweight planning note for lake crossings, rain shells, bus links, and volcano-view days that need flexible timing.",
    },
    {
      title: "Sri Lanka Rail Days Without Rushing Them",
      destination: "Sri Lanka",
      readingTime: "3 min read",
      description:
        "A lightweight editorial tip for seat planning, tea-country stopovers, station snacks, and keeping scenic routes unhurried.",
    },
  ];

  return (
    <section className="px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.32fr_0.68fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/46">
            CoVoyage Insights
          </p>
          <h2 className="mt-3 font-serif text-4xl text-[#f8f4ea]">
            Quick notes for better travel days
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {insightJournalPosts.map((post) => (
            <Link
              className="group border-b border-white/10 pb-5"
              href={`/journal/explore?journal=${post.slug}`}
              key={post.slug}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/46">
                {post.destination} / {post.readingTime}
              </p>
              <h3 className="mt-3 font-serif text-2xl leading-tight text-[#f8f4ea]">
                {post.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/60">
                {post.excerpt}
              </p>
            </Link>
          ))}
          {planningNotes.map((note) => (
            <div className="border-b border-white/10 pb-5" key={note.title}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/46">
                {note.destination} / {note.readingTime}
              </p>
              <h3 className="mt-3 font-serif text-2xl leading-tight text-[#f8f4ea]">
                {note.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/60">
                {note.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ShareJourneySection() {
  return (
    <section className="bg-[#050505] px-5 py-16 text-white sm:px-8 lg:py-24" id="create-post">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/50">
            Share Your Journey
          </p>
          <h2 className="mt-4 font-serif text-5xl leading-tight">
            Have a story to tell?
          </h2>
          <p className="mt-5 text-base leading-8 text-white/68">
            Share a story, photo, video, guide, or travel tip with the CoVoyage
            community.
          </p>
        </div>
        <Link
          className="inline-flex h-12 w-fit items-center gap-3 rounded-full bg-[#f8f4ea] px-6 text-sm font-semibold text-[#050505] transition-colors hover:bg-white"
          href="/journal/create"
        >
          <Plus className="h-4 w-4" />
          Create a Post
        </Link>
      </div>
    </section>
  );
}

function MediaPicker({
  accept,
  currentUrl,
  fileKind,
  label,
  onFile,
  onRemove,
  selection,
}: {
  accept: string;
  currentUrl: string;
  fileKind: "image" | "video";
  label: string;
  onFile: (file: File) => void;
  onRemove: () => void;
  selection: MediaSelection | null;
}) {
  const previewUrl = selection?.previewUrl || resolveMediaUrl(currentUrl);
  const fileLabel = selection
    ? `${selection.file.name} / ${formatFileSize(selection.file.size)}`
    : currentUrl
      ? "Uploaded media attached"
      : "";

  return (
    <div className="block text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
      {label}
      <div className="mt-2 overflow-hidden border border-dashed border-white/14 bg-[#1b1b1b]">
        {previewUrl ? (
          <div>
            <div className="relative min-h-56 bg-[#0b0b0b]">
              {fileKind === "video" ? (
                <video
                  className="h-64 w-full object-cover"
                  controls
                  muted
                  playsInline
                  src={previewUrl}
                />
              ) : (
                <div
                  className="h-64 bg-cover bg-center"
                  role="img"
                  style={{ backgroundImage: `url(${previewUrl})` }}
                />
              )}
            </div>
            <div className="flex flex-col gap-3 border-t border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs normal-case tracking-normal text-white/58">
                {fileLabel}
              </p>
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex h-9 cursor-pointer items-center rounded-full border border-white/14 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-white/62 hover:border-white/40 hover:text-white">
                  Replace
                  <input
                    accept={accept}
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0];

                      if (file) {
                        onFile(file);
                      }

                      event.target.value = "";
                    }}
                    type="file"
                  />
                </label>
                <button
                  className="h-9 rounded-full border border-white/14 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-white/62 hover:border-white/40 hover:text-white"
                  onClick={onRemove}
                  type="button"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <label className="flex min-h-48 cursor-pointer flex-col items-center justify-center gap-3 p-6 text-center transition-colors hover:bg-white/[0.03]">
            <span className="grid h-12 w-12 place-items-center rounded-full border border-white/18 text-white/70">
              <Plus className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f8f4ea]">
              {label}
            </span>
            <span className="text-xs normal-case tracking-normal text-white/50">
              Choose from your device
            </span>
            <input
              accept={accept}
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (file) {
                  onFile(file);
                }

                event.target.value = "";
              }}
              type="file"
            />
          </label>
        )}
      </div>
    </div>
  );
}

export function CreatePostModal({
  onClose,
  onSaved,
  initialBlog,
}: {
  onClose: () => void;
  onSaved: (blog: Blog) => void;
  initialBlog: Blog | null;
}) {
  const [form, setForm] = useState<JournalFormState>(
    initialBlog ? formFromBlog(initialBlog) : emptyJournalForm,
  );
  const [savedBlog, setSavedBlog] = useState<Blog | null>(initialBlog);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [coverSelection, setCoverSelection] = useState<MediaSelection | null>(null);
  const [videoSelection, setVideoSelection] = useState<MediaSelection | null>(null);

  useEffect(() => {
    return () => {
      if (coverSelection) {
        URL.revokeObjectURL(coverSelection.previewUrl);
      }

      if (videoSelection) {
        URL.revokeObjectURL(videoSelection.previewUrl);
      }
    };
  }, [coverSelection, videoSelection]);

  const setField = (field: keyof JournalFormState, value: string) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
    setMessage("");
  };

  const handleMediaSelection = (
    file: File,
    mediaKind: "image" | "video",
    onValidSelection: (selection: MediaSelection) => void,
  ) => {
    const acceptedTypes = mediaKind === "image" ? acceptedImageTypes : acceptedVideoTypes;
    const maxBytes = mediaKind === "image" ? maxImageBytes : maxVideoBytes;

    if (!acceptedTypes.includes(file.type)) {
      setMessage(
        mediaKind === "image"
          ? "Choose a JPG, PNG, or WEBP image."
          : "Choose an MP4, WEBM, or MOV video.",
      );
      return;
    }

    if (file.size > maxBytes) {
      setMessage(
        `Choose a ${mediaKind === "image" ? "photo" : "video"} smaller than ${
          maxBytes / (1024 * 1024)
        } MB.`,
      );
      return;
    }

    onValidSelection({
      file,
      previewUrl: URL.createObjectURL(file),
    });
    setMessage("");
  };

  const replaceCoverSelection = (selection: MediaSelection | null) => {
    if (coverSelection) {
      URL.revokeObjectURL(coverSelection.previewUrl);
    }

    setCoverSelection(selection);

    if (selection) {
      setField("coverImageUrl", "");
    }
  };

  const replaceVideoSelection = (selection: MediaSelection | null) => {
    if (videoSelection) {
      URL.revokeObjectURL(videoSelection.previewUrl);
    }

    setVideoSelection(selection);

    if (selection) {
      setField("mediaUrl", "");
    }
  };

  const saveJournal = async (status: JournalStatus) => {
    const token = getValidAuthToken();

    if (!token) {
      setMessage("Log in to save or publish your journal.");
      return;
    }

    if (!form.title.trim() || !form.content.trim()) {
      setMessage("Add a title and journal content before saving.");
      return;
    }

    if (form.format === "Photo" && !coverSelection && !form.coverImageUrl.trim()) {
      setMessage("Choose a photo before saving a photo journal.");
      return;
    }

    if (form.format === "Video" && !videoSelection && !form.mediaUrl.trim()) {
      setMessage("Choose a video before saving a reel.");
      return;
    }

    setIsSaving(true);

    try {
      let nextForm = form;

      if (coverSelection) {
        const upload = await uploadJournalMedia(coverSelection.file, "image", token);
        nextForm = { ...nextForm, coverImageUrl: upload.media_url };
        replaceCoverSelection(null);
      }

      if (videoSelection) {
        const upload = await uploadJournalMedia(videoSelection.file, "video", token);
        nextForm = { ...nextForm, mediaUrl: upload.media_url };
        replaceVideoSelection(null);
      }

      setForm(nextForm);

      const payload = buildBlogPayload(nextForm, status);
      const nextBlog = savedBlog
        ? await updateBlog(savedBlog.id, payload, token)
        : await createBlog(payload, token);

      setSavedBlog(nextBlog);
      onSaved(nextBlog);
      setMessage(
        status === "published"
          ? "Journal published."
          : savedBlog
            ? "Draft updated."
            : "Draft saved.",
      );
    } catch (error) {
      setMessage(
        error instanceof ApiError ? error.detail : "Unable to save this journal.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto bg-[#121212] p-6 text-[#f8f4ea] shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/46">
              Create
            </p>
            <h2 className="mt-2 font-serif text-4xl text-[#f8f4ea]">
              {savedBlog ? "Edit Journal" : "Create a Journal"}
            </h2>
          </div>
          <button
            aria-label="Close create post modal"
            className="grid h-10 w-10 place-items-center rounded-full border border-white/14 text-white/60 hover:text-white"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form className="mt-7 space-y-5" onSubmit={(event) => event.preventDefault()}>
          <div className="grid gap-3 sm:grid-cols-3">
            {(["Photo", "Video", "Text"] as CreateFormat[]).map((option) => (
              <button
                className={
                  form.format === option
                    ? "h-12 rounded-full bg-[#f8f4ea] text-xs font-semibold uppercase tracking-[0.18em] text-[#050505]"
                    : "h-12 rounded-full border border-white/14 text-xs font-semibold uppercase tracking-[0.18em] text-white/58 hover:border-white/40 hover:text-white"
                }
                key={option}
                onClick={() => setField("format", option)}
                type="button"
              >
                {option === "Photo" ? "Post" : option === "Video" ? "Reel" : "Text"}
              </button>
            ))}
          </div>
          <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
            What are you sharing?
            <select
              className="mt-2 h-12 w-full border border-white/14 bg-[#1b1b1b] px-4 text-sm normal-case tracking-normal text-[#f8f4ea]"
              onChange={(event) => setField("category", event.target.value)}
              value={form.category}
            >
              <option>Stories</option>
              <option>Guides</option>
              <option>Media</option>
              <option>Tips</option>
            </select>
          </label>
          <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
            Title
            <input
              className="mt-2 h-12 w-full border border-white/14 bg-[#1b1b1b] px-4 text-sm normal-case tracking-normal text-[#f8f4ea]"
              onChange={(event) => setField("title", event.target.value)}
              value={form.title}
            />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
            Destination
            <input
              className="mt-2 h-12 w-full border border-white/14 bg-[#1b1b1b] px-4 text-sm normal-case tracking-normal text-[#f8f4ea]"
              onChange={(event) => setField("destination", event.target.value)}
              value={form.destination}
            />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
            Description
            <textarea
              className="mt-2 min-h-20 w-full border border-white/14 bg-[#1b1b1b] p-4 text-sm normal-case tracking-normal text-[#f8f4ea]"
              maxLength={300}
              onChange={(event) => setField("excerpt", event.target.value)}
              value={form.excerpt}
            />
          </label>
          {form.format === "Photo" || form.format === "Text" ? (
            <MediaPicker
              accept="image/jpeg,image/png,image/webp"
              currentUrl={form.coverImageUrl}
              fileKind="image"
              label={form.format === "Photo" ? "Add Photo" : "Optional Cover Photo"}
              onFile={(file) =>
                handleMediaSelection(file, "image", replaceCoverSelection)
              }
              onRemove={() => {
                replaceCoverSelection(null);
                setField("coverImageUrl", "");
              }}
              selection={coverSelection}
            />
          ) : null}
          {form.format === "Video" ? (
            <>
              <MediaPicker
                accept="video/mp4,video/webm,video/quicktime"
                currentUrl={form.mediaUrl}
                fileKind="video"
                label="Add Video"
                onFile={(file) =>
                  handleMediaSelection(file, "video", replaceVideoSelection)
                }
                onRemove={() => {
                  replaceVideoSelection(null);
                  setField("mediaUrl", "");
                }}
                selection={videoSelection}
              />
              <MediaPicker
                accept="image/jpeg,image/png,image/webp"
                currentUrl={form.coverImageUrl}
                fileKind="image"
                label="Optional Poster Image"
                onFile={(file) =>
                  handleMediaSelection(file, "image", replaceCoverSelection)
                }
                onRemove={() => {
                  replaceCoverSelection(null);
                  setField("coverImageUrl", "");
                }}
                selection={coverSelection}
              />
            </>
          ) : null}
          <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
            Content
            <textarea
              className="mt-2 min-h-32 w-full border border-white/14 bg-[#1b1b1b] p-4 text-sm normal-case tracking-normal text-[#f8f4ea]"
              onChange={(event) => setField("content", event.target.value)}
              value={form.content}
            />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
            Tags
            <input
              className="mt-2 h-12 w-full border border-white/14 bg-[#1b1b1b] px-4 text-sm normal-case tracking-normal text-[#f8f4ea]"
              onChange={(event) => setField("tags", event.target.value)}
              placeholder="slow travel, kyoto, food"
              value={form.tags}
            />
          </label>
          {message ? (
            <div className="flex items-center gap-2 bg-white/10 px-4 py-3 text-sm text-white/70" role="status">
              <Check className="h-4 w-4" />
              {message}
            </div>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <button
              className="inline-flex h-12 items-center gap-3 rounded-full border border-white/18 px-6 text-sm font-semibold text-white/70 hover:border-white/45 hover:text-white"
              disabled={isSaving}
              onClick={() => saveJournal("draft")}
              type="button"
            >
              Save Draft
            </button>
            <button
              className="inline-flex h-12 items-center gap-3 rounded-full bg-[#f8f4ea] px-6 text-sm font-semibold text-[#050505] hover:bg-white disabled:opacity-60"
              disabled={isSaving}
              onClick={() => saveJournal("published")}
              type="button"
            >
              <Send className="h-4 w-4" />
              Publish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
