"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { Blog } from "@/lib/journalApi";

import { CreatePostModal } from "../JournalPageClient";

export function CreateJournalPageClient() {
  const router = useRouter();
  const [savedBlog, setSavedBlog] = useState<Blog | null>(null);

  return (
    <>
      <main className="min-h-[60vh] bg-[#050505] px-5 py-10 text-[#f8f4ea] sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3">
          <Link
            className="inline-flex h-10 items-center justify-center rounded-full border border-white/18 px-4 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:border-white/45"
            href="/journal"
          >
            Journals
          </Link>
          <Link
            className="inline-flex h-10 items-center justify-center rounded-full border border-white/18 px-4 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:border-white/45"
            href="/journal/explore"
          >
            Explore
          </Link>
          <span className="inline-flex h-10 items-center justify-center rounded-full bg-[#f8f4ea] px-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#050505]">
            Create
          </span>
          <Link
            className="inline-flex h-10 items-center justify-center rounded-full border border-white/18 px-4 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:border-white/45"
            href="/journal/my-journals"
          >
            My Journals
          </Link>
        </div>
      </main>
      <CreatePostModal
        initialBlog={savedBlog}
        onClose={() => router.push("/journal")}
        onSaved={setSavedBlog}
      />
    </>
  );
}
