export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");

const AUTH_TOKEN_KEY = "covoyage_access_token";
const AUTH_USER_KEY = "covoyage_user";
const AUTH_CHANGE_EVENT = "covoyage-auth-change";

export type AuthUser = {
  name?: string;
  email?: string;
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

  constructor(status: number, detail: unknown) {
    const message = getApiErrorMessage(detail);

    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = message;
  }
}

function authChanged() {
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function onAuthChange(callback: () => void) {
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
  window.localStorage.setItem(AUTH_TOKEN_KEY, loginResponse.access_token);

  if (loginResponse.user) {
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(loginResponse.user));
  }

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

export function clearAuth() {
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
  authChanged();
}

export function isAuthenticated() {
  return Boolean(getAuthToken());
}

export function isAuthTokenExpired(token: string | null) {
  if (!token) {
    return true;
  }

  try {
    const payload = JSON.parse(window.atob(token.split(".")[1])) as {
      exp?: number;
    };

    if (!payload.exp) {
      return true;
    }

    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
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
