import { authService } from "./auth";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

async function getToken(): Promise<string> {
  const t = authService.getToken();
  if (!t) throw new Error("Not authenticated");
  return t;
}

export const uploadService = {
  async uploadImage(file: File): Promise<string> {
    const token = await getToken();
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE_URL}/admin/upload/image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.detail || "Upload failed");
    }

    const data = await res.json();
    const baseUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:8000";
    return `${baseUrl}${data.url}`;
  },
};
