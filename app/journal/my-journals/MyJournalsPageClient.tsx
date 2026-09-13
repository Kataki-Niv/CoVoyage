"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ApiError, getValidAuthToken } from "@/lib/api";
import { getMyBlogs, type Blog } from "@/lib/journalApi";

import { CreatePostModal, MyJournalsPanel } from "../JournalPageClient";

export function MyJournalsPageClient() {
  const [journals, setJournals] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);

  const loadJournals = async () => {
    const token = getValidAuthToken();

    if (!token) {
      setJournals([]);
      setError("Log in to view your journals and drafts.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      setJournals(await getMyBlogs(token));
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.detail
          : "Unable to load your journals right now.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadJournals();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const handleSaved = (blog: Blog) => {
    setEditingBlog(blog);
    setJournals((currentJournals) => {
      const existingJournal = currentJournals.find(
        (journal) => journal.id === blog.id,
      );

      if (!existingJournal) {
        return [blog, ...currentJournals];
      }

      return currentJournals.map((journal) =>
        journal.id === blog.id ? blog : journal,
      );
    });
  };

  return (
    <>
      <main className="bg-[#050505] text-[#f8f4ea]">
        <section className="border-b border-white/10 bg-[#050505] px-5 py-4 sm:px-8">
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
            <Link
              className="inline-flex h-10 items-center justify-center rounded-full border border-white/18 px-4 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:border-white/45"
              href="/journal/create"
            >
              Create
            </Link>
            <span className="inline-flex h-10 items-center justify-center rounded-full bg-[#f8f4ea] px-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#050505]">
              My Journals
            </span>
          </div>
        </section>
        <MyJournalsPanel
          error={error}
          isLoading={isLoading}
          journals={journals}
          onClose={() => undefined}
          onDelete={(blog) => {
            setJournals((currentJournals) =>
              currentJournals.filter((journal) => journal.id !== blog.id),
            );
          }}
          onEdit={setEditingBlog}
          onRefresh={loadJournals}
          showClose={false}
        />
      </main>
      {editingBlog ? (
        <CreatePostModal
          initialBlog={editingBlog}
          onClose={() => setEditingBlog(null)}
          onSaved={handleSaved}
        />
      ) : null}
    </>
  );
}
