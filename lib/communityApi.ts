import { apiRequest } from "@/lib/api";

export const COMMUNITY_TIP_CATEGORIES = [
  "Safety",
  "Food",
  "Transport",
  "Hidden Gems",
  "Scams",
  "Cultural Etiquette",
] as const;

export type CommunityTipCategory = (typeof COMMUNITY_TIP_CATEGORIES)[number];

export type CommunityAuthor = {
  name: string;
  role?: string | null;
  location?: string | null;
};

export type CommunityTipResponse = {
  id: string;
  country_slug: string;
  place_slug: string;
  text: string;
  author: CommunityAuthor;
  author_id?: string | null;
  category: CommunityTipCategory;
  rating?: number | null;
  created_at: string;
  updated_at: string;
  moderation_status: "pending" | "approved" | "rejected";
  helpful_count: number;
  reply_count: number;
};

export type CommunityReplyResponse = {
  id: string;
  tip_id: string;
  text: string;
  author: CommunityAuthor;
  author_id?: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateCommunityTipRequest = {
  country_slug: string;
  place_slug: string;
  text: string;
  category: CommunityTipCategory;
  rating?: number | null;
};

export type CreateCommunityReplyRequest = {
  text: string;
};

export type DeleteCommunityTipResponse = {
  deleted: boolean;
  id: string;
  deleted_reply_count: number;
};

export type DeleteCommunityReplyResponse = {
  deleted: boolean;
  id: string;
  tip_id: string;
};

export function fetchCommunityTips(placeSlug: string) {
  return apiRequest<CommunityTipResponse[]>(
    `/community/tips/${encodeURIComponent(placeSlug)}`,
  );
}

export function createCommunityTip(tip: CreateCommunityTipRequest, token?: string | null) {
  return apiRequest<CommunityTipResponse>("/community/tips", {
    method: "POST",
    body: JSON.stringify(tip),
    token,
  });
}

export function fetchCommunityReplies(tipId: string) {
  return apiRequest<CommunityReplyResponse[]>(
    `/community/tips/${encodeURIComponent(tipId)}/replies`,
  );
}

export function createCommunityReply(
  tipId: string,
  reply: CreateCommunityReplyRequest,
  token?: string | null,
) {
  return apiRequest<CommunityReplyResponse>(
    `/community/tips/${encodeURIComponent(tipId)}/reply`,
    {
      method: "POST",
      body: JSON.stringify(reply),
      token,
    },
  );
}

export function deleteCommunityTip(tipId: string, token?: string | null) {
  return apiRequest<DeleteCommunityTipResponse>(
    `/community/tips/${encodeURIComponent(tipId)}`,
    {
      method: "DELETE",
      token,
    },
  );
}

export function deleteCommunityReply(
  tipId: string,
  replyId: string,
  token?: string | null,
) {
  return apiRequest<DeleteCommunityReplyResponse>(
    `/community/tips/${encodeURIComponent(tipId)}/replies/${encodeURIComponent(
      replyId,
    )}`,
    {
      method: "DELETE",
      token,
    },
  );
}
