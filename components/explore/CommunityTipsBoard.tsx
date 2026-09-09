"use client";

import { X } from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import type { CommunityTip } from "@/components/explore/destinationData";
import {
  COMMUNITY_TIP_CATEGORIES,
  createCommunityReply,
  createCommunityTip,
  deleteCommunityReply,
  deleteCommunityTip,
  fetchCommunityReplies,
  fetchCommunityTips,
  type CommunityReplyResponse,
  type CommunityTipCategory,
  type CommunityTipResponse,
} from "@/lib/communityApi";
import {
  apiRequest,
  getStoredUser,
  getValidAuthToken,
  onAuthChange,
  storeAuthUser,
  type AuthSessionResponse,
  type AuthUser,
} from "@/lib/api";

type CommunityTipsBoardProps = {
  countrySlug: string;
  isDarkEditorial: boolean;
  placeName: string;
  placeSlug?: string;
  tips: CommunityTip[];
};

type TipReply = {
  id?: string;
  author: string;
  authorId?: string | null;
  text: string;
};

type DiscussionTip = {
  id: string;
  author: string;
  authorId?: string | null;
  category: CommunityTipCategory;
  detail: string;
  moderationStatus?: "pending" | "approved" | "rejected";
  quote: string;
  rating: string;
  replies: TipReply[];
  replyCount: number;
};

const fallbackReplies: TipReply[][] = [
  [
    {
      author: "Maya Chen",
      text: "Did you need a 4x4 for this route?",
    },
    {
      author: "Jon",
      text: "Yes. Check road conditions before heading out, especially after rain.",
    },
  ],
  [
    {
      author: "Arjun Mehta",
      text: "Leaving early made a huge difference for us.",
    },
    {
      author: "Elena Rossi",
      text: "Was it easy to find places to stop along the way?",
    },
    {
      author: "Maya Chen",
      text: "A few scenic stops were easy, but food and fuel need planning.",
    },
  ],
  [
    {
      author: "Riya Sen",
      text: "This helped us slow down instead of chasing too many stops.",
    },
    {
      author: "Noah Patel",
      text: "The light later in the day was beautiful for photos.",
    },
  ],
];

function parseTraveler(traveler: string) {
  const [name, ...detailParts] = traveler.split(",");
  const detail = detailParts
    .join(",")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());

  return {
    detail,
    name: name.trim() || "CoVoyage Traveler",
  };
}

function buildSeedTips(placeName: string, tips: CommunityTip[]): DiscussionTip[] {
  const baseTips: DiscussionTip[] = tips.map((tip, index) => {
    const traveler = parseTraveler(tip.traveler);

    return {
      id: `${placeName}-${tip.traveler}-${index}`,
      author: traveler.name,
      category: "Hidden Gems",
      detail: traveler.detail || tip.location,
      quote: tip.quote,
      rating: tip.rating,
      replies: fallbackReplies[index % fallbackReplies.length],
      replyCount: fallbackReplies[index % fallbackReplies.length].length,
    };
  });

  const extraTips: DiscussionTip[] = [
    {
      id: `${placeName}-early-start`,
      author: "Maya Chen",
      category: "Transport",
      detail: "Recent traveler",
      quote:
        "Start earlier than feels necessary. The quieter hours made the whole route feel calmer and more personal.",
      rating: "4.7",
      replies: fallbackReplies[1],
      replyCount: fallbackReplies[1].length,
    },
    {
      id: `${placeName}-pack-layers`,
      author: "Arjun Mehta",
      category: "Safety",
      detail: "Road trip planner",
      quote:
        "Keep a warm layer and snacks within reach. The weather shifts quickly, and small delays are part of the rhythm.",
      rating: "4.6",
      replies: fallbackReplies[2],
      replyCount: fallbackReplies[2].length,
    },
  ];

  return [...baseTips, ...extraTips];
}

function getAuthorDetail(author: CommunityTipResponse["author"]) {
  return [author.role, author.location].filter(Boolean).join(" · ");
}

function mapApiReply(reply: CommunityReplyResponse): TipReply {
  return {
    id: reply.id,
    author: reply.author.name,
    authorId: reply.author_id,
    text: reply.text,
  };
}

function mapApiTip(tip: CommunityTipResponse): DiscussionTip {
  return {
    id: tip.id,
    author: tip.author.name,
    authorId: tip.author_id,
    category: tip.category,
    detail: getAuthorDetail(tip.author) || "Community traveler",
    moderationStatus: tip.moderation_status,
    quote: tip.text,
    rating: typeof tip.rating === "number" ? tip.rating.toFixed(1) : "New",
    replies: [],
    replyCount: tip.reply_count,
  };
}

function normalizeOwnershipId(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getCurrentUserOwnershipIds(user: AuthUser | null) {
  if (!user) {
    return new Set<string>();
  }

  const legacyUser = user as AuthUser & { _id?: string };

  return new Set(
    [user.user_id, user.id, legacyUser._id]
      .map(normalizeOwnershipId)
      .filter(Boolean),
  );
}

export function CommunityTipsBoard({
  countrySlug,
  isDarkEditorial,
  placeName,
  placeSlug,
  tips,
}: CommunityTipsBoardProps) {
  const seedTips = useMemo(() => buildSeedTips(placeName, tips), [placeName, tips]);
  const [discussionTips, setDiscussionTips] = useState<DiscussionTip[]>(() =>
    placeSlug ? [] : seedTips,
  );
  const [expandedTipId, setExpandedTipId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<"All" | CommunityTipCategory>(
    "All",
  );
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTip, setNewTip] = useState({
    category: "Hidden Gems" as CommunityTipCategory,
    quote: "",
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingTips, setIsLoadingTips] = useState(Boolean(placeSlug));
  const [storedUser, setStoredUser] = useState(() => getStoredUser());
  const [deletingTipId, setDeletingTipId] = useState<string | null>(null);
  const [deletingReplyId, setDeletingReplyId] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    if (!placeSlug) {
      return () => {
        isActive = false;
      };
    }

    fetchCommunityTips(placeSlug)
      .then((apiTips) => {
        if (!isActive) {
          return;
        }

        setDiscussionTips(apiTips.map(mapApiTip));
        setErrorMessage(null);
      })
      .catch(() => {
        if (!isActive) {
          return;
        }

        setErrorMessage("Community tips are unavailable right now.");
        setDiscussionTips([]);
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingTips(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [placeSlug, seedTips]);

  useEffect(() => {
    const refreshStoredUser = async () => {
      const token = getValidAuthToken();

      if (!token) {
        setStoredUser(getStoredUser());
        return;
      }

      try {
        const session = await apiRequest<AuthSessionResponse>("/auth/session", {
          token,
        });

        if (session.user) {
          storeAuthUser(session.user);
          setStoredUser(session.user);
          return;
        }
      } catch {
        setStoredUser(getStoredUser());
      }
    };

    void refreshStoredUser();

    return onAuthChange(() => setStoredUser(getStoredUser()));
  }, []);

  const displayedTips = useMemo(
    () =>
      activeCategory === "All"
        ? discussionTips
        : discussionTips.filter((tip) => tip.category === activeCategory),
    [activeCategory, discussionTips],
  );

  const storedUserName =
    storedUser?.name || storedUser?.username || storedUser?.email?.split("@")[0] || "";
  const storedUserIds = getCurrentUserOwnershipIds(storedUser);

  const canDeleteTip = (tip: DiscussionTip) =>
    Boolean(placeSlug && storedUserIds.has(normalizeOwnershipId(tip.authorId)));

  const canDeleteReply = (reply: TipReply) =>
    Boolean(
      placeSlug &&
        reply.id &&
        storedUserIds.has(normalizeOwnershipId(reply.authorId)),
    );

  const handleTipToggle = useCallback(
    async (tip: DiscussionTip) => {
      const nextTipId = expandedTipId === tip.id ? null : tip.id;
      setExpandedTipId(nextTipId);

      if (!nextTipId || !placeSlug || tip.replies.length) {
        return;
      }

      try {
        const replies = await fetchCommunityReplies(tip.id);
        setDiscussionTips((currentTips) =>
          currentTips.map((currentTip) =>
            currentTip.id === tip.id
              ? {
                  ...currentTip,
                  replies: replies.map(mapApiReply),
                  replyCount: replies.length,
                }
              : currentTip,
          ),
        );
      } catch {
        setErrorMessage("Replies are unavailable right now.");
      }
    },
    [expandedTipId, placeSlug],
  );

  const handleReplySubmit = async (tipId: string) => {
    const draft = replyDrafts[tipId]?.trim();

    if (!draft) {
      return;
    }

    if (!storedUserName) {
      setErrorMessage("Please sign in to reply to community tips.");
      return;
    }

    if (placeSlug) {
      try {
        const reply = await createCommunityReply(tipId, {
          text: draft,
        }, getValidAuthToken());

        setDiscussionTips((currentTips) =>
          currentTips.map((tip) =>
            tip.id === tipId
              ? {
                  ...tip,
                  replies: [...tip.replies, mapApiReply(reply)],
                  replyCount: tip.replyCount + 1,
                }
              : tip,
          ),
        );
        setReplyDrafts((currentDrafts) => ({ ...currentDrafts, [tipId]: "" }));
        setErrorMessage(null);
      } catch {
        setErrorMessage("Your reply could not be posted. Please try again.");
      }

      return;
    }

    setDiscussionTips((currentTips) =>
      currentTips.map((tip) =>
        tip.id === tipId
          ? {
              ...tip,
              replies: [
                ...tip.replies,
                {
                  author: storedUserName,
                  text: draft,
                },
              ],
              replyCount: tip.replyCount + 1,
            }
          : tip,
      ),
    );
    setReplyDrafts((currentDrafts) => ({ ...currentDrafts, [tipId]: "" }));
  };

  const handleShareTip = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const quote = newTip.quote.trim();

    if (!storedUserName || !quote) {
      return;
    }

    if (placeSlug) {
      try {
        const createdTip = await createCommunityTip({
          country_slug: countrySlug,
          place_slug: placeSlug,
          text: quote,
          category: newTip.category,
        }, getValidAuthToken());

        setDiscussionTips((currentTips) => [
          mapApiTip(createdTip),
          ...currentTips,
        ]);
        setNewTip({
          category: "Hidden Gems",
          quote: "",
        });
        setIsModalOpen(false);
        setErrorMessage(null);
      } catch {
        setErrorMessage("Your tip could not be shared. Please try again.");
      }

      return;
    }

    setDiscussionTips((currentTips) => [
      {
        id: `${placeName}-${Date.now()}`,
        author: storedUserName,
        category: newTip.category,
        detail: "Community traveler",
        moderationStatus: "approved",
        quote,
        rating: "New",
        replies: [],
        replyCount: 0,
      },
      ...currentTips,
    ]);
    setNewTip({
      category: "Hidden Gems",
      quote: "",
    });
    setIsModalOpen(false);
  };

  const handleDeleteTip = async (tipId: string) => {
    const token = getValidAuthToken();

    if (!token) {
      setErrorMessage("Please sign in to delete your community tip.");
      return;
    }

    setDeletingTipId(tipId);

    try {
      await deleteCommunityTip(tipId, token);
      setDiscussionTips((currentTips) =>
        currentTips.filter((tip) => tip.id !== tipId),
      );
      setExpandedTipId((currentTipId) =>
        currentTipId === tipId ? null : currentTipId,
      );
      setErrorMessage(null);
    } catch {
      setErrorMessage("Your tip could not be deleted. Please try again.");
    } finally {
      setDeletingTipId(null);
    }
  };

  const handleDeleteReply = async (tipId: string, replyId: string) => {
    const token = getValidAuthToken();

    if (!token) {
      setErrorMessage("Please sign in to delete your reply.");
      return;
    }

    setDeletingReplyId(replyId);

    try {
      await deleteCommunityReply(tipId, replyId, token);
      setDiscussionTips((currentTips) =>
        currentTips.map((tip) =>
          tip.id === tipId
            ? {
                ...tip,
                replies: tip.replies.filter((reply) => reply.id !== replyId),
                replyCount: Math.max(0, tip.replyCount - 1),
              }
            : tip,
        ),
      );
      setErrorMessage(null);
    } catch {
      setErrorMessage("Your reply could not be deleted. Please try again.");
    } finally {
      setDeletingReplyId(null);
    }
  };

  return (
    <section
      className={
        isDarkEditorial
          ? "mt-5 border-t border-[#D8BE8A]/18 bg-[#0E0E0F]/86 px-3 py-4 sm:px-4"
          : "mt-5 border-t border-[#e4d0c6] bg-[#f5ece4] px-3 py-4 sm:px-4"
      }
    >
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p
            className={
              isDarkEditorial
                ? "text-xs font-medium uppercase tracking-[0.3em] text-[#D8BE8A]"
                : "text-xs font-medium uppercase tracking-[0.3em] text-[#9b6b5f]"
            }
          >
            Community Tips
          </p>
          <h2
            className={
              isDarkEditorial
                ? "mt-2 font-serif text-3xl text-[#F5F1E8] sm:text-4xl"
                : "mt-2 font-serif text-3xl text-[#443733] sm:text-4xl"
            }
          >
            {placeName} Community
          </h2>
        </div>
        <button
          className={
            isDarkEditorial
              ? "inline-flex w-fit border border-[#D8BE8A]/36 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#D8BE8A] transition-colors hover:bg-[#D8BE8A] hover:text-[#0B0B0C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D8BE8A]"
              : "inline-flex w-fit border border-[#b99686] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#7d584e] transition-colors hover:bg-[#efe1d8]"
          }
          onClick={() => setIsModalOpen(true)}
          type="button"
        >
          Share a Community Tip
        </button>
      </div>

      {errorMessage ? (
        <p
          className={
            isDarkEditorial
              ? "mb-3 text-sm text-[#D8BE8A]"
              : "mb-3 text-sm text-[#8d6255]"
          }
        >
          {errorMessage}
        </p>
      ) : null}

      {discussionTips.length ? (
        <div className="mb-4 flex flex-wrap gap-2">
          {(["All", ...COMMUNITY_TIP_CATEGORIES] as const).map((category) => {
            const isActive = activeCategory === category;

            return (
              <button
                className={
                  isDarkEditorial
                    ? `border px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] transition-colors ${
                        isActive
                          ? "border-[#D8BE8A] bg-[#D8BE8A] text-[#0B0B0C]"
                          : "border-[#D8BE8A]/24 text-[#D8BE8A] hover:border-[#D8BE8A]/45"
                      }`
                    : `border px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] transition-colors ${
                        isActive
                          ? "border-[#7d584e] bg-[#7d584e] text-[#fffaf3]"
                          : "border-[#b99686] text-[#7d584e] hover:bg-[#efe1d8]"
                      }`
                }
                key={category}
                onClick={() => setActiveCategory(category)}
                type="button"
              >
                {category}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="grid gap-3">
        {isLoadingTips ? (
          <div
            className={
              isDarkEditorial
                ? "border border-[#D8BE8A]/18 bg-[#151515] px-4 py-4 text-sm text-[#B8B0A4]"
                : "border border-[#dfc9be] bg-[#fffaf3] px-4 py-4 text-sm text-[#6f5b53]"
            }
          >
            Loading community tips...
          </div>
        ) : null}

        {!isLoadingTips && !discussionTips.length ? (
          <div
            className={
              isDarkEditorial
                ? "border border-[#D8BE8A]/18 bg-[#151515] px-4 py-4 text-sm text-[#B8B0A4]"
                : "border border-[#dfc9be] bg-[#fffaf3] px-4 py-4 text-sm text-[#6f5b53]"
            }
          >
            No community tips yet. Share the first practical note for this place.
          </div>
        ) : null}

        {!isLoadingTips && discussionTips.length && !displayedTips.length ? (
          <div
            className={
              isDarkEditorial
                ? "border border-[#D8BE8A]/18 bg-[#151515] px-4 py-4 text-sm text-[#B8B0A4]"
                : "border border-[#dfc9be] bg-[#fffaf3] px-4 py-4 text-sm text-[#6f5b53]"
            }
          >
            No tips in this category yet.
          </div>
        ) : null}

        {displayedTips.map((tip) => {
          const isExpanded = expandedTipId === tip.id;

          return (
            <article
              className={
                isDarkEditorial
                  ? "border border-[#D8BE8A]/18 bg-[#151515] px-4 py-4 transition duration-300 hover:border-[#D8BE8A]/34 hover:bg-[#191918]"
                  : "border border-[#dfc9be] bg-[#fffaf3] px-4 py-4"
              }
              key={tip.id}
            >
              <span
                className={
                  isDarkEditorial
                    ? "mb-3 inline-flex border border-[#D8BE8A]/24 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-[#D8BE8A]"
                    : "mb-3 inline-flex border border-[#b99686] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-[#7d584e]"
                }
              >
                {tip.category}
                {tip.moderationStatus === "pending" ? " / Pending" : ""}
              </span>
              <p
                className={
                  isDarkEditorial
                    ? "text-sm leading-6 text-[#D9D0C2]"
                    : "text-sm leading-6 text-[#6f5b53]"
                }
              >
                &quot;{tip.quote}&quot;
              </p>

              <div
                className={
                  isDarkEditorial
                    ? "mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-white/10 pt-3"
                    : "mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-[#eadbd2] pt-3"
                }
              >
                <div>
                  <p
                    className={
                      isDarkEditorial
                        ? "text-sm font-medium text-[#F5F1E8]"
                        : "text-sm font-medium text-[#4f413c]"
                    }
                  >
                    {tip.author}
                  </p>
                  <p
                    className={
                      isDarkEditorial
                        ? "mt-1 text-[10px] uppercase tracking-[0.14em] text-[#9E9589]"
                        : "mt-1 text-[10px] uppercase tracking-[0.14em] text-[#a89288]"
                    }
                  >
                    {tip.detail} · {tip.rating === "New" ? "New" : `★ ${tip.rating}`}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-[11px] uppercase tracking-[0.14em]">
                  <button
                    className={
                      isDarkEditorial
                        ? "text-[#D8BE8A] transition-colors hover:text-[#F5F1E8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D8BE8A]"
                        : "text-[#8d6255] transition-colors hover:text-[#5a3b2d]"
                    }
                    onClick={() => handleTipToggle(tip)}
                    type="button"
                  >
                    {tip.replyCount} replies
                  </button>
                  <button
                    className={
                      isDarkEditorial
                        ? "text-[#D8BE8A] transition-colors hover:text-[#F5F1E8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D8BE8A]"
                        : "text-[#8d6255] transition-colors hover:text-[#5a3b2d]"
                    }
                    onClick={() => handleTipToggle(tip)}
                    type="button"
                  >
                    {isExpanded ? "Collapse" : "Reply"}
                  </button>
                  {canDeleteTip(tip) ? (
                    <button
                      className={
                        isDarkEditorial
                          ? "text-[#D8BE8A] transition-colors hover:text-[#F5F1E8] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D8BE8A]"
                          : "text-[#8d6255] transition-colors hover:text-[#5a3b2d] disabled:cursor-not-allowed disabled:opacity-45"
                      }
                      disabled={deletingTipId === tip.id}
                      onClick={() => handleDeleteTip(tip.id)}
                      type="button"
                    >
                      {deletingTipId === tip.id ? "Deleting" : "Delete"}
                    </button>
                  ) : null}
                </div>
              </div>

              {isExpanded ? (
                <div
                  className={
                    isDarkEditorial
                      ? "mt-4 border-l border-[#D8BE8A]/24 bg-[#0B0B0C]/58 px-4 py-4"
                      : "mt-4 border-l border-[#d8b7aa] bg-[#f5ece4] px-4 py-4"
                  }
                >
                  <p
                    className={
                      isDarkEditorial
                        ? "text-[10px] font-medium uppercase tracking-[0.2em] text-[#D8BE8A]"
                        : "text-[10px] font-medium uppercase tracking-[0.2em] text-[#a16f61]"
                    }
                  >
                    {tip.replyCount} Replies
                  </p>
                  <div className="mt-3 space-y-3">
                    {tip.replies.length ? (
                      tip.replies.map((reply, index) => (
                        <div key={reply.id ?? `${reply.author}-${index}`}>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p
                              className={
                                isDarkEditorial
                                  ? "text-xs font-medium text-[#F5F1E8]"
                                  : "text-xs font-medium text-[#4f413c]"
                              }
                            >
                              {reply.author}
                            </p>
                            {canDeleteReply(reply) && reply.id ? (
                              <button
                                className={
                                  isDarkEditorial
                                    ? "text-[10px] font-medium uppercase tracking-[0.14em] text-[#D8BE8A] transition-colors hover:text-[#F5F1E8] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D8BE8A]"
                                    : "text-[10px] font-medium uppercase tracking-[0.14em] text-[#8d6255] transition-colors hover:text-[#5a3b2d] disabled:cursor-not-allowed disabled:opacity-45"
                                }
                                disabled={deletingReplyId === reply.id}
                                onClick={() => handleDeleteReply(tip.id, reply.id!)}
                                type="button"
                              >
                                {deletingReplyId === reply.id ? "Deleting" : "Delete"}
                              </button>
                            ) : null}
                          </div>
                          <p
                            className={
                              isDarkEditorial
                                ? "mt-1 text-sm leading-6 text-[#B8B0A4]"
                                : "mt-1 text-sm leading-6 text-[#6f5b53]"
                            }
                          >
                            {reply.text}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p
                        className={
                          isDarkEditorial
                            ? "text-sm text-[#9E9589]"
                            : "text-sm text-[#8d6255]"
                        }
                      >
                        Be the first traveler to reply.
                      </p>
                    )}
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <input
                      className={
                        isDarkEditorial
                          ? "h-10 border border-white/10 bg-[#111112] px-3 text-sm text-[#F5F1E8] outline-none placeholder:text-[#9E9589] focus:border-[#D8BE8A]/45"
                          : "h-10 border border-[#d8b7aa] bg-[#fffaf3] px-3 text-sm text-[#4f413c] outline-none placeholder:text-[#a89288]"
                      }
                      onChange={(event) =>
                        setReplyDrafts((currentDrafts) => ({
                          ...currentDrafts,
                          [tip.id]: event.target.value,
                        }))
                      }
                      placeholder={storedUserName ? "Write a reply..." : "Sign in to reply..."}
                      value={replyDrafts[tip.id] ?? ""}
                    />
                    <button
                      className={
                        isDarkEditorial
                          ? "h-10 border border-[#D8BE8A]/36 px-4 text-[11px] font-medium uppercase tracking-[0.16em] text-[#D8BE8A] transition-colors hover:bg-[#D8BE8A] hover:text-[#0B0B0C] disabled:cursor-not-allowed disabled:opacity-45"
                          : "h-10 border border-[#b99686] px-4 text-[11px] font-medium uppercase tracking-[0.16em] text-[#7d584e] transition-colors hover:bg-[#efe1d8] disabled:cursor-not-allowed disabled:opacity-45"
                      }
                      disabled={!storedUserName || !replyDrafts[tip.id]?.trim()}
                      onClick={() => handleReplySubmit(tip.id)}
                      type="button"
                    >
                      Post
                    </button>
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/48 px-4 backdrop-blur-[2px]">
          <form
            aria-label={`Share a ${placeName} community tip`}
            className={
              isDarkEditorial
                ? "w-full max-w-md border border-[#D8BE8A]/24 bg-[#111112] p-4 shadow-2xl shadow-black/40"
                : "w-full max-w-md border border-[#d8b7aa] bg-[#fffaf3] p-4 shadow-2xl shadow-[#4e3f39]/25"
            }
            onSubmit={handleShareTip}
          >
            <div
              className={
                isDarkEditorial
                  ? "flex items-start justify-between gap-4 border-b border-white/10 pb-4"
                  : "flex items-start justify-between gap-4 border-b border-[#eadbd2] pb-4"
              }
            >
              <div>
                <p
                  className={
                    isDarkEditorial
                      ? "text-[10px] font-medium uppercase tracking-[0.18em] text-[#D8BE8A]"
                      : "text-[10px] font-medium uppercase tracking-[0.18em] text-[#a16f61]"
                  }
                >
                  Community Tips
                </p>
                <h2
                  className={
                    isDarkEditorial
                      ? "mt-1 font-serif text-2xl leading-tight text-[#F5F1E8]"
                      : "mt-1 font-serif text-2xl leading-tight text-[#443733]"
                  }
                >
                  Share a {placeName} Tip
                </h2>
              </div>
              <button
                aria-label="Close"
                className={
                  isDarkEditorial
                    ? "grid h-9 w-9 place-items-center rounded-full border border-[#D8BE8A]/24 text-[#D8BE8A] transition-colors hover:bg-[#D8BE8A] hover:text-[#0B0B0C]"
                    : "grid h-9 w-9 place-items-center rounded-full border border-[#d8b7aa] text-[#6f5b53] transition-colors hover:bg-[#efe1d8]"
                }
                onClick={() => setIsModalOpen(false)}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 pt-5">
              <div
                className={
                  isDarkEditorial
                    ? "block text-[10px] font-medium uppercase tracking-[0.18em] text-[#D8BE8A]/80"
                    : "block text-[10px] font-medium uppercase tracking-[0.18em] text-[#8d6255]"
                }
              >
                Posting as
                <div
                  className={
                    isDarkEditorial
                      ? "mt-2 border border-white/10 bg-[#0B0B0C] px-3 py-3"
                      : "mt-2 border border-[#d8b7aa] bg-[#fbf8f2] px-3 py-3"
                  }
                >
                  <p
                    className={
                      isDarkEditorial
                        ? "text-sm normal-case tracking-normal text-[#F5F1E8]"
                        : "text-sm normal-case tracking-normal text-[#4f413c]"
                    }
                  >
                    {storedUserName || "Sign in to post"}
                  </p>
                  <p
                    className={
                      isDarkEditorial
                        ? "mt-1 text-xs normal-case leading-5 tracking-normal text-[#9E9589]"
                        : "mt-1 text-xs normal-case leading-5 tracking-normal text-[#8d6255]"
                    }
                  >
                    Your profile name will be shown with this community tip.
                  </p>
                </div>
              </div>
              <label
                className={
                  isDarkEditorial
                    ? "block text-[10px] font-medium uppercase tracking-[0.18em] text-[#D8BE8A]/80"
                    : "block text-[10px] font-medium uppercase tracking-[0.18em] text-[#8d6255]"
                }
              >
                Category
                <select
                  className={
                    isDarkEditorial
                      ? "mt-2 h-11 w-full border border-white/10 bg-[#0B0B0C] px-3 text-sm text-[#F5F1E8] outline-none focus:border-[#D8BE8A]/45"
                      : "mt-2 h-11 w-full border border-[#d8b7aa] bg-[#fbf8f2] px-3 text-sm text-[#4f413c] outline-none"
                  }
                  onChange={(event) =>
                    setNewTip((currentTip) => ({
                      ...currentTip,
                      category: event.target.value as CommunityTipCategory,
                    }))
                  }
                  value={newTip.category}
                >
                  {COMMUNITY_TIP_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
              <label
                className={
                  isDarkEditorial
                    ? "block text-[10px] font-medium uppercase tracking-[0.18em] text-[#D8BE8A]/80"
                    : "block text-[10px] font-medium uppercase tracking-[0.18em] text-[#8d6255]"
                }
              >
                Tip
                <textarea
                  className={
                    isDarkEditorial
                      ? "mt-2 min-h-28 w-full resize-none border border-white/10 bg-[#0B0B0C] p-3 text-sm text-[#F5F1E8] outline-none placeholder:text-[#9E9589] focus:border-[#D8BE8A]/45"
                      : "mt-2 min-h-28 w-full resize-none border border-[#d8b7aa] bg-[#fbf8f2] p-3 text-sm text-[#4f413c] outline-none placeholder:text-[#a89288]"
                  }
                  onChange={(event) =>
                    setNewTip((currentTip) => ({
                      ...currentTip,
                      quote: event.target.value,
                    }))
                  }
                  placeholder="Share a practical local note..."
                  value={newTip.quote}
                />
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                className={
                  isDarkEditorial
                    ? "border border-white/10 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#B8B0A4] transition-colors hover:border-white/20 hover:text-[#F5F1E8]"
                    : "border border-[#d8b7aa] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#7d584e] transition-colors hover:bg-[#efe1d8]"
                }
                onClick={() => setIsModalOpen(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className={
                  isDarkEditorial
                    ? "bg-[#D8BE8A] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#0B0B0C] transition-colors hover:bg-[#F5F1E8] disabled:cursor-not-allowed disabled:opacity-45"
                    : "bg-[#7d584e] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#fffaf3] disabled:cursor-not-allowed disabled:opacity-45"
                }
                disabled={!storedUserName || !newTip.quote.trim()}
                type="submit"
              >
                Share Tip
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}
