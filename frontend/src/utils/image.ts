const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:8000";

export function getImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("https://")) return url;
  if (url.startsWith("http://localhost:"))
    return url.replace(/^https?:\/\/localhost:\d+/, BASE_URL);
  if (url.startsWith("/")) return `${BASE_URL}${url}`;
  return url;
}
