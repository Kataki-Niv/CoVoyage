"use client";

import { ArrowRight, MessageCircle, RefreshCw, SearchX } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import {
  ApiError,
  clearAuth,
  getChats,
  getValidAuthToken,
  resolveMediaUrl,
} from "@/lib/api";
import type { ChatConversation } from "@/lib/api";

function getDisplayName(conversation: ChatConversation) {
  if (conversation.type === "group_voyage") {
    return conversation.voyage_title || "Group Voyage";
  }

  return (
    conversation.other_profile?.name ||
    conversation.other_profile?.username ||
    "CoVoyage Traveler"
  );
}

function getLocation(conversation: ChatConversation) {
  if (conversation.type === "group_voyage") {
    return [
      conversation.voyage_destination,
      conversation.voyage_status ? `${conversation.voyage_status} voyage` : null,
    ]
      .filter(Boolean)
      .join(" - ");
  }

  return [
    conversation.other_profile?.city,
    conversation.other_profile?.country,
  ]
    .filter(Boolean)
    .join(", ");
}

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "C";
}

function formatActivityTime(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isToday) {
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

function ProfileAvatar({
  name,
  imageUrl,
}: {
  name: string;
  imageUrl?: string | null;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  const resolvedImageUrl = resolveMediaUrl(imageUrl);

  if (!resolvedImageUrl || imageFailed) {
    return (
      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-white/12 bg-[#f8f4ea] font-serif text-2xl text-black">
        {getInitial(name)}
      </div>
    );
  }

  return (
    <Image
      alt={`${name} profile`}
      className="h-14 w-14 shrink-0 rounded-full border border-white/12 object-cover"
      height={56}
      src={resolvedImageUrl}
      unoptimized
      width={56}
      onError={() => setImageFailed(true)}
    />
  );
}

function ConversationRow({ conversation }: { conversation: ChatConversation }) {
  const displayName = getDisplayName(conversation);
  const location = getLocation(conversation);
  const activityTime = formatActivityTime(
    conversation.last_message_at || conversation.updated_at,
  );
  const preview =
    conversation.last_message_preview ||
    (conversation.type === "group_voyage"
      ? "No messages yet. Start planning with this Group Voyage."
      : "No messages yet. Start the conversation when you are ready.");

  return (
    <Link
      className="group grid gap-4 border border-white/10 bg-white/[0.035] p-4 text-left transition duration-300 hover:-translate-y-0.5 hover:border-[#f8f4ea]/34 hover:bg-white/[0.055] sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-5"
      href={`/chat/${encodeURIComponent(conversation.id)}`}
    >
      <ProfileAvatar
        imageUrl={conversation.other_profile?.profile_picture_url}
        name={displayName}
      />
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="truncate font-serif text-2xl leading-tight text-white">
            {displayName}
          </h2>
          {conversation.other_profile?.username ? (
            <span className="text-sm text-white/42">
              @{conversation.other_profile.username}
            </span>
          ) : null}
          {conversation.type === "group_voyage" ? (
            <span className="text-sm text-white/42">Group Chat</span>
          ) : null}
        </div>
        {location ? (
          <p className="mt-1 truncate text-xs uppercase tracking-[0.18em] text-white/38">
            {location}
          </p>
        ) : null}
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/60">
          {preview}
        </p>
      </div>
      <div className="flex items-center justify-between gap-4 sm:h-full sm:flex-col sm:items-end">
        {activityTime ? (
          <span className="text-xs uppercase tracking-[0.18em] text-white/40">
            {activityTime}
          </span>
        ) : null}
        <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-[#f8f4ea]/72 transition group-hover:text-white">
          Open
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

export default function ChatInboxPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadConversations = useCallback(async () => {
    const token = getValidAuthToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const nextConversations = await getChats(token);
      setConversations(nextConversations);
    } catch (caughtError) {
      if (caughtError instanceof ApiError && caughtError.status === 401) {
        clearAuth();
        router.replace("/login");
        return;
      }

      setError(
        caughtError instanceof ApiError
          ? caughtError.detail
          : "Unable to load conversations.",
      );
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void Promise.resolve().then(loadConversations);
  }, [loadConversations]);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#050505] text-[#f8f4ea]">
        <Navbar />
        <main className="bg-[#050505]">
          <section className="mx-auto max-w-7xl px-5 pb-8 pt-16 sm:px-8">
            <div className="flex flex-col gap-6 border-b border-white/10 pb-8 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.34em] text-white/42">
                  <MessageCircle className="h-4 w-4" />
                  Chat
                </p>
                <h1 className="font-serif text-5xl leading-tight text-white sm:text-6xl">
                  Conversations
                </h1>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-white/62 sm:text-base sm:leading-8">
                  Keep planning with travelers you have connected with through
                  Find Your Tribe or joined through Group Voyages.
                </p>
              </div>
              <Button
                className="w-fit border-white/16 bg-transparent text-white hover:bg-white/10"
                disabled={isLoading}
                type="button"
                variant="outline"
                onClick={loadConversations}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </section>

          <section className="mx-auto max-w-5xl px-5 pb-24 sm:px-8">
            {error ? (
              <p className="border border-red-400/30 bg-red-950/30 px-4 py-3 text-sm text-red-100">
                {error}
              </p>
            ) : null}

            {isLoading ? (
              <div className="border border-white/10 bg-white/[0.03] p-6">
                <p className="text-sm text-white/58">
                  Loading conversations...
                </p>
              </div>
            ) : null}

            {!isLoading && !error && conversations.length === 0 ? (
              <div className="border border-white/10 bg-white/[0.03] p-6 text-center sm:p-10">
                <SearchX className="mx-auto h-8 w-8 text-white/44" />
                <h2 className="mt-5 font-serif text-3xl leading-tight text-white">
                  No conversations yet
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/60">
                  Chats open after you and another traveler accept each other
                  through Find Your Tribe. Once that connection is made, your
                  shared plans can continue here.
                </p>
                <Button
                  asChild
                  className="mt-6 bg-[#f8f4ea] text-black hover:bg-white"
                >
                  <Link href="/tribe">Find Your Tribe</Link>
                </Button>
              </div>
            ) : null}

            {!isLoading && !error && conversations.length > 0 ? (
              <div className="grid gap-4">
                {conversations.map((conversation) => (
                  <ConversationRow
                    conversation={conversation}
                    key={conversation.id}
                  />
                ))}
              </div>
            ) : null}
          </section>
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}
