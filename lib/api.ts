import { API_BASE_URL } from "@/lib/apiConfig";

export { API_BASE_URL };

const AUTH_TOKEN_KEY = "covoyage_access_token";
const AUTH_USER_KEY = "covoyage_user";
const AUTH_CHANGE_EVENT = "covoyage-auth-change";

export type AuthUser = {
  id?: string;
  user_id?: string;
  name?: string;
  username?: string;
  email?: string;
  email_verified?: boolean;
  email_verified_at?: string | null;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  user?: AuthUser;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthSessionResponse = {
  authenticated: boolean;
  user?: AuthUser;
};

export type ChatProfile = {
  user_id: string;
  name?: string;
  username?: string;
  bio?: string | null;
  profile_picture_url?: string | null;
  city?: string | null;
  country?: string | null;
};

export type ChatConversation = {
  id: string;
  participant_ids: string[];
  type?: "direct" | "group_voyage";
  pair_key?: string | null;
  voyage_id?: string | null;
  voyage_title?: string | null;
  voyage_destination?: string | null;
  voyage_status?: string | null;
  connection_request_id?: string | null;
  created_at: string;
  updated_at: string;
  last_message_at?: string | null;
  last_message_preview?: string | null;
  other_user_id?: string | null;
  other_profile?: ChatProfile | null;
  current_user_id?: string | null;
};

export type ChatMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
  read_at?: string | null;
  sender_profile?: ChatProfile | null;
};

export type ChatReadResponse = {
  updated_count: number;
  read_at: string;
};

export type AccountResponse = {
  user: AuthUser;
  email_delivery_configured: boolean;
};

export type PasswordChangeRequest = {
  current_password: string;
  new_password: string;
  confirm_password: string;
};

export type AccountMessageResponse = {
  message: string;
  email_delivery_configured?: boolean;
};

export type ProfileImageUploadResponse<TProfile = unknown> = {
  profile_picture_url: string;
  profile: TProfile;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function getApiErrorMessage(
  detail: unknown,
  fallback = "Request failed.",
): string {
  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => getApiErrorMessage(item, ""))
      .filter(Boolean);

    return messages.length ? messages.join(" ") : fallback;
  }

  if (isRecord(detail)) {
    if ("detail" in detail) {
      return getApiErrorMessage(detail.detail, fallback);
    }

    if (typeof detail.message === "string") {
      return detail.message;
    }

    if (typeof detail.msg === "string") {
      const location = Array.isArray(detail.loc)
        ? detail.loc
            .filter((part) => part !== "body")
            .map(String)
            .join(".")
        : "";

      return location ? `${location}: ${detail.msg}` : detail.msg;
    }
  }

  return fallback;
}

export class ApiError extends Error {
  status: number;
  detail: string;
  rawDetail: unknown;

  constructor(status: number, detail: unknown) {
    const message = getApiErrorMessage(detail);

    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = message;
    this.rawDetail = detail;
  }
}

function authChanged() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function onAuthChange(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  window.addEventListener(AUTH_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(AUTH_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function getAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getValidAuthToken() {
  const token = getAuthToken();

  if (!token) {
    return null;
  }

  if (isAuthTokenExpired(token)) {
    clearAuth();
    return null;
  }

  return token;
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const user = window.localStorage.getItem(AUTH_USER_KEY);

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user) as AuthUser;
  } catch {
    window.localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
}

export function storeAuth(loginResponse: LoginResponse) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_TOKEN_KEY, loginResponse.access_token);

  if (loginResponse.user) {
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(loginResponse.user));
  }

  authChanged();
}

export function storeAuthUser(user: AuthUser) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  authChanged();
}

export function loginUser(credentials: LoginRequest) {
  return apiRequest<LoginResponse>("/login", {
    method: "POST",
    body: JSON.stringify({
      email: credentials.email.trim(),
      password: credentials.password,
    }),
  });
}

export function getChats(token: string) {
  return apiRequest<ChatConversation[]>("/chats", { token });
}

export function createChat(targetUserId: string, token: string) {
  return apiRequest<ChatConversation>("/chats", {
    method: "POST",
    token,
    body: JSON.stringify({ target_user_id: targetUserId }),
  });
}

export function createGroupVoyageChat(voyageId: string, token: string) {
  return apiRequest<ChatConversation>(
    `/chats/group-voyages/${encodeURIComponent(voyageId)}`,
    {
      method: "POST",
      token,
    },
  );
}

export function getChatMessages(chatId: string, token: string) {
  return apiRequest<ChatMessage[]>(`/chats/${encodeURIComponent(chatId)}/messages`, {
    token,
  });
}

export function sendChatMessage(chatId: string, body: string, token: string) {
  return apiRequest<ChatMessage>(`/chats/${encodeURIComponent(chatId)}/messages`, {
    method: "POST",
    token,
    body: JSON.stringify({ body }),
  });
}

export function markChatRead(chatId: string, token: string) {
  return apiRequest<ChatReadResponse>(`/chats/${encodeURIComponent(chatId)}/read`, {
    method: "PATCH",
    token,
  });
}

export function getAccount(token: string) {
  return apiRequest<AccountResponse>("/account", { token });
}

export function changePassword(update: PasswordChangeRequest, token: string) {
  return apiRequest<AccountMessageResponse>("/account/password", {
    method: "PATCH",
    token,
    body: JSON.stringify(update),
  });
}

export function deleteAccount(token: string) {
  return apiRequest<AccountMessageResponse>("/account", {
    method: "DELETE",
    token,
  });
}

export function requestEmailVerification(token: string) {
  return apiRequest<AccountMessageResponse>("/account/email/verification/request", {
    method: "POST",
    token,
  });
}

export function confirmEmailVerification(token: string) {
  return apiRequest<AccountMessageResponse>("/account/email/verification/confirm", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

export function requestPasswordReset(email: string) {
  return apiRequest<AccountMessageResponse>("/account/password-reset/request", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function confirmPasswordReset(
  update: {
    token: string;
    new_password: string;
    confirm_password: string;
  },
) {
  return apiRequest<AccountMessageResponse>("/account/password-reset/confirm", {
    method: "POST",
    body: JSON.stringify(update),
  });
}

export function resolveMediaUrl(url?: string | null) {
  if (!url) {
    return "";
  }

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }

  return url.startsWith("/") ? `${API_BASE_URL}${url}` : url;
}

async function fileToBase64(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const chunkSize = 8192;
  let binary = "";

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return window.btoa(binary);
}

export async function uploadProfileImage<TProfile = unknown>(
  file: File,
  token: string,
) {
  return apiRequest<ProfileImageUploadResponse<TProfile>>("/profile/image", {
    method: "POST",
    token,
    body: JSON.stringify({
      file_name: file.name,
      content_type: file.type,
      content_base64: await fileToBase64(file),
    }),
  });
}

export function clearAuth() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
  authChanged();
}

export function isAuthenticated() {
  return Boolean(getValidAuthToken());
}

export function isAuthTokenExpired(token: string | null) {
  if (!token) {
    return true;
  }

  const payload = decodeJwtPayload<{ exp?: number }>(token);

  if (!payload?.exp) {
    return true;
  }

  return payload.exp * 1000 <= Date.now();
}

export function decodeJwtPayload<TPayload = Record<string, unknown>>(
  token: string | null,
): TPayload | null {
  if (!token || typeof window === "undefined") {
    return null;
  }

  const payloadSegment = token.split(".")[1];

  if (!payloadSegment) {
    return null;
  }

  try {
    const base64 = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );

    return JSON.parse(window.atob(paddedBase64)) as TPayload;
  } catch {
    return null;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch (error) {
    throw new ApiError(
      0,
      error instanceof TypeError
        ? `Unable to connect to the server at ${API_BASE_URL}. Make sure the FastAPI backend is running.`
        : "Unable to connect to the server.",
    );
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    if (response.status === 401) {
      clearAuth();
    }

    throw new ApiError(
      response.status,
      data?.detail ?? data?.message ?? data ?? "Request failed.",
    );
  }

  return data as T;
}
