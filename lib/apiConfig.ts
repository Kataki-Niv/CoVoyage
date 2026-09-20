export const LOCAL_API_BASE_URL = "http://127.0.0.1:8000";

export function normalizeApiBaseUrl(value?: string | null) {
  const configuredValue = value?.trim();
  return (configuredValue || LOCAL_API_BASE_URL).replace(/\/+$/, "");
}

export const API_BASE_URL = normalizeApiBaseUrl(
  process.env.NEXT_PUBLIC_API_BASE_URL,
);
