import { apiRequest } from "@/lib/api";

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
  created_at: string;
  updated_at: string;
};

export type CreateCommunityTipRequest = {
  country_slug: string;
  place_slug: string;
  text: string;
  author: CommunityAuthor;
  rating?: number | null;
};

export type CreateCommunityReplyRequest = {
  text: string;
  author: CommunityAuthor;
};

export function fetchCommunityTips(placeSlug: string) {
  return apiRequest<CommunityTipResponse[]>(
    `/community/tips/${encodeURIComponent(placeSlug)}`,
  );
}

export function createCommunityTip(tip: CreateCommunityTipRequest) {
  return apiRequest<CommunityTipResponse>("/community/tips", {
    method: "POST",
    body: JSON.stringify(tip),
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
) {
  return apiRequest<CommunityReplyResponse>(
    `/community/tips/${encodeURIComponent(tipId)}/reply`,
    {
      method: "POST",
      body: JSON.stringify(reply),
    },
  );
}
