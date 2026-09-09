"use client";

import {
  ArrowLeft,
  CalendarDays,
  MessageCircle,
  RefreshCw,
  Send,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import {
  ApiError,
  clearAuth,
  getChatMessages,
  getChats,
  getValidAuthToken,
  markChatRead,
  resolveMediaUrl,
  sendChatMessage,
} from "@/lib/api";
import type { ChatConversation, ChatMessage } from "@/lib/api";

function getDisplayName(conversation?: ChatConversation | null) {
  if (conversation?.type === "group_voyage") {
    return conversation.voyage_title || "Group Voyage";
  }

  return (
    conversation?.other_profile?.name ||
    conversation?.other_profile?.username ||
    "CoVoyage Traveler"
  );
}

function getLocation(conversation?: ChatConversation | null) {
  if (conversation?.type === "group_voyage") {
    return [
      conversation.voyage_destination,
      conversation.voyage_status ? `${conversation.voyage_status} voyage` : null,
    ]
      .filter(Boolean)
      .join(" - ");
  }

  return [
    conversation?.other_profile?.city,
    conversation?.other_profile?.country,
  ]
    .filter(Boolean)
    .join(", ");
}

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "C";
}

function formatMessageTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
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

function MessageAvatar({
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
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/12 bg-white/[0.08] font-serif text-sm text-white">
        {getInitial(name)}
      </div>
    );
  }

  return (
    <Image
      alt={`${name} profile`}
      className="h-8 w-8 shrink-0 rounded-full border border-white/12 object-cover"
      height={32}
      src={resolvedImageUrl}
      unoptimized
      width={32}
      onError={() => setImageFailed(true)}
    />
  );
}

function MessageBubble({
  message,
  isOutgoing,
  showSender,
}: {
  message: ChatMessage;
  isOutgoing: boolean;
  showSender?: boolean;
}) {
  const senderName =
    message.sender_profile?.name ||
    message.sender_profile?.username ||
    "CoVoyage Traveler";

  return (
    <div
      className={`flex items-end gap-2 ${
        isOutgoing ? "justify-end" : "justify-start"
      }`}
    >
      {showSender && !isOutgoing ? (
        <MessageAvatar
          imageUrl={message.sender_profile?.profile_picture_url}
          name={senderName}
        />
      ) : null}
      <div
        className={`max-w-[84%] rounded-[8px] px-4 py-3 shadow-lg shadow-black/10 sm:max-w-[70%] ${
          isOutgoing
            ? "bg-[#f8f4ea] text-black"
            : "border border-white/10 bg-white/[0.06] text-white"
          }`}
      >
        {showSender ? (
          <p
            className={`mb-1 text-xs font-medium ${
              isOutgoing ? "text-black/58" : "text-[#f8f4ea]/68"
            }`}
          >
            {senderName}
          </p>
        ) : null}
        <p className="whitespace-pre-wrap break-words text-sm leading-6">
          {message.body}
        </p>
        <p
          className={`mt-2 text-[0.68rem] ${
            isOutgoing ? "text-black/52" : "text-white/40"
          }`}
        >
          {formatMessageTime(message.created_at)}
        </p>
      </div>
      {showSender && isOutgoing ? (
        <MessageAvatar
          imageUrl={message.sender_profile?.profile_picture_url}
          name={senderName}
        />
      ) : null}
    </div>
  );
}

export default function ChatThreadPage() {
  const router = useRouter();
  const params = useParams();
  const rawChatId = params.chatId;
  const chatId = Array.isArray(rawChatId) ? rawChatId[0] : rawChatId;
  const [conversation, setConversation] = useState<ChatConversation | null>(
    null,
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [sendError, setSendError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  const currentUserId = useMemo(() => {
    if (!conversation) {
      return "";
    }

    if (conversation.current_user_id) {
      return conversation.current_user_id;
    }

    return (
      conversation.participant_ids.find(
        (participantId) => participantId !== conversation.other_user_id,
      ) || ""
    );
  }, [conversation]);

  const loadThread = useCallback(async () => {
    const token = getValidAuthToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    if (!chatId) {
      setError("Chat not found.");
      setIsLoading(false);
      return;
    }

    setError("");
    setSendError("");
    setIsLoading(true);

    try {
      const conversations = await getChats(token);
      const activeConversation =
        conversations.find((item) => item.id === chatId) || null;

      if (!activeConversation) {
        setConversation(null);
        setMessages([]);
        setError("Chat not found.");
        return;
      }

      const nextMessages = await getChatMessages(chatId, token);
      setConversation(activeConversation);
      setMessages(nextMessages);
      void markChatRead(chatId, token).catch(() => undefined);
    } catch (caughtError) {
      if (caughtError instanceof ApiError && caughtError.status === 401) {
        clearAuth();
        router.replace("/login");
        return;
      }

      setError(
        caughtError instanceof ApiError
          ? caughtError.detail
          : "Unable to load this conversation.",
      );
      setConversation(null);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [chatId, router]);

  useEffect(() => {
    void Promise.resolve().then(loadThread);
  }, [loadThread]);

  useEffect(() => {
    if (!isLoading) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isLoading, messages.length]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const body = draft.trim();

    if (!body || !chatId || isSending) {
      return;
    }

    const token = getValidAuthToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setIsSending(true);
    setSendError("");

    try {
      const createdMessage = await sendChatMessage(chatId, body, token);
      setMessages((currentMessages) => [...currentMessages, createdMessage]);
      setConversation((currentConversation) =>
        currentConversation
          ? {
              ...currentConversation,
              updated_at: createdMessage.created_at,
              last_message_at: createdMessage.created_at,
              last_message_preview: createdMessage.body.slice(0, 160),
            }
          : currentConversation,
      );
      setDraft("");
    } catch (caughtError) {
      if (caughtError instanceof ApiError && caughtError.status === 401) {
        clearAuth();
        router.replace("/login");
        return;
      }

      setSendError(
        caughtError instanceof ApiError
          ? caughtError.detail
          : "Unable to send message.",
      );
    } finally {
      setIsSending(false);
    }
  };

  const displayName = getDisplayName(conversation);
  const location = getLocation(conversation);
  const canSend = draft.trim().length > 0 && !isSending && !isLoading && !error;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#050505] text-[#f8f4ea]">
        <Navbar />
        <main className="bg-[#050505]">
          <section className="mx-auto max-w-7xl px-5 pb-6 pt-8 sm:px-8">
            <div className="flex flex-col gap-5 border-b border-white/10 pb-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <Button
                  className="h-11 w-11 shrink-0 border-white/16 bg-transparent px-0 text-white hover:bg-white/10"
                  title="Back to conversations"
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/chat")}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                {conversation ? (
                  <ProfileAvatar
                    imageUrl={conversation.other_profile?.profile_picture_url}
                    name={displayName}
                  />
                ) : (
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-white/12 bg-white/[0.04] text-white/44">
                    <UserRound className="h-6 w-6" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.3em] text-white/40">
                    <MessageCircle className="h-4 w-4" />
                    Conversation
                  </p>
                  <h1 className="truncate font-serif text-3xl leading-tight text-white sm:text-4xl">
                    {displayName}
                  </h1>
                  {location ? (
                    <p className="mt-1 truncate text-sm text-white/48">
                      {location}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {conversation?.type !== "group_voyage" &&
                conversation?.other_user_id ? (
                  <Button
                    asChild
                    className="border-white/16 bg-transparent text-white hover:bg-white/10"
                    variant="outline"
                  >
                    <Link
                      href={`/profile/${encodeURIComponent(
                        conversation.other_user_id,
                      )}`}
                    >
                      View Profile
                    </Link>
                  </Button>
                ) : null}
                <Button
                  className="border-white/16 bg-transparent text-white hover:bg-white/10"
                  disabled={isLoading}
                  type="button"
                  variant="outline"
                  onClick={loadThread}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>
            </div>
          </section>

          <section className="mx-auto flex max-w-5xl flex-col px-5 pb-24 sm:px-8">
            {error ? (
              <div className="border border-red-400/30 bg-red-950/30 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
            ) : null}

            {isLoading ? (
              <div className="border border-white/10 bg-white/[0.03] p-6">
                <p className="text-sm text-white/58">Loading messages...</p>
              </div>
            ) : null}

            {!isLoading && !error && conversation ? (
              <div className="grid min-h-[calc(100vh-17rem)] grid-rows-[1fr_auto] border border-white/10 bg-white/[0.025]">
                <div className="max-h-[calc(100vh-22rem)] min-h-[24rem] overflow-y-auto px-4 py-5 sm:px-6">
                  {messages.length === 0 ? (
                    <div className="grid h-full min-h-[20rem] place-items-center text-center">
                      <div>
                        <CalendarDays className="mx-auto h-8 w-8 text-white/40" />
                        <h2 className="mt-5 font-serif text-3xl text-white">
                          Start with the next detail
                        </h2>
                        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-white/58">
                          This chat is ready. Share dates, routes, questions, or
                          the small travel preferences that make a trip easier.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <MessageBubble
                          isOutgoing={message.sender_id === currentUserId}
                          key={message.id}
                          message={message}
                          showSender={conversation.type === "group_voyage"}
                        />
                      ))}
                      <div ref={messageEndRef} />
                    </div>
                  )}
                </div>

                <form
                  className="border-t border-white/10 bg-black/30 p-3 sm:p-4"
                  onSubmit={handleSubmit}
                >
                  {sendError ? (
                    <p className="mb-3 border border-red-400/30 bg-red-950/30 px-3 py-2 text-sm text-red-100">
                      {sendError}
                    </p>
                  ) : null}
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                    <textarea
                      className="max-h-40 min-h-12 resize-y rounded-[4px] border border-white/10 bg-black/35 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/35 focus:border-[#f8f4ea]/45"
                      maxLength={2000}
                      placeholder={`Message ${displayName}`}
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" &&
                          !event.shiftKey &&
                          !event.nativeEvent.isComposing
                        ) {
                          event.preventDefault();
                          event.currentTarget.form?.requestSubmit();
                        }
                      }}
                    />
                    <Button
                      className="h-12 bg-[#f8f4ea] px-6 text-black hover:bg-white"
                      disabled={!canSend}
                      type="submit"
                    >
                      <Send className="h-4 w-4" />
                      {isSending ? "Sending..." : "Send"}
                    </Button>
                  </div>
                  <p className="mt-2 text-right text-[0.68rem] uppercase tracking-[0.18em] text-white/32">
                    {draft.length}/2000
                  </p>
                </form>
              </div>
            ) : null}
          </section>
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}
