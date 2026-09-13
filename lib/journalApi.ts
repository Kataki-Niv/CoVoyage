import { apiRequest } from "@/lib/api";

export type JournalStatus = "draft" | "published";
export type JournalBackendCategory = "stories" | "guides" | "tips";
export type JournalBackendFormat = "text" | "photo" | "video";

export type Blog = {
  id: string;
  title: string;
  content: string;
  excerpt?: string | null;
  tags: string[];
  category?: JournalBackendCategory | "photos" | "videos" | null;
  format: JournalBackendFormat;
  destination_slug?: string | null;
  destination_name?: string | null;
  cover_image_url?: string | null;
  media_url?: string | null;
  status: JournalStatus;
  slug: string;
  author_id: string;
  author_name: string;
  author_email: string;
  created_at: string;
  updated_at: string;
};

export type BlogPayload = {
  title: string;
  content: string;
  excerpt?: string | null;
  tags?: string[];
  category: JournalBackendCategory;
  format: JournalBackendFormat;
  destination_name?: string | null;
  cover_image_url?: string | null;
  media_url?: string | null;
  status: JournalStatus;
};

export type JournalMediaUploadResponse = {
  media_url: string;
};

async function fileToBase64(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const chunkSize = 8192;
  let binary = "";

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return window.btoa(binary);
}

export function createBlog(payload: BlogPayload, token: string) {
  return apiRequest<Blog>("/blogs", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function updateBlog(blogId: string, payload: Partial<BlogPayload>, token: string) {
  return apiRequest<Blog>(`/blogs/${encodeURIComponent(blogId)}`, {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
  });
}

export function deleteBlog(blogId: string, token: string) {
  return apiRequest<void>(`/blogs/${encodeURIComponent(blogId)}`, {
    method: "DELETE",
    token,
  });
}

export function getMyBlogs(token: string) {
  return apiRequest<Blog[]>("/blogs/me", { token });
}

export async function uploadJournalMedia(
  file: File,
  mediaKind: "image" | "video",
  token: string,
) {
  return apiRequest<JournalMediaUploadResponse>("/blogs/media", {
    method: "POST",
    token,
    body: JSON.stringify({
      media_kind: mediaKind,
      file_name: file.name,
      content_type: file.type,
      content_base64: await fileToBase64(file),
    }),
  });
}
