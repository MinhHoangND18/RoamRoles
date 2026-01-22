import { Page } from "@/types";
import { API_CONFIG } from "@/lib/api/config";

const API_BASE_URL = `${API_CONFIG.BASE_URL}/api`;

export const getPages = async (): Promise<Page[]> => {
  const res = await fetch(`${API_BASE_URL}/pages`);
  if (!res.ok) {
    throw new Error("Failed to fetch pages");
  }
  return res.json();
};

export const checkSlugUniqueness = async (slug: string): Promise<{ exists: boolean }> => {
  const response = await fetch(`${API_BASE_URL}/pages/check-slug?slug=${slug}`);
  if (!response.ok) {
    return { exists: true };
  }
  return response.json();
};

export const getPage = async (id: string): Promise<Page | null> => {
  if (!id || isNaN(Number(id))) {
    throw new Error("A numeric ID is required to get a page.");
  }
  const numericId = Number(id);
  const pages = await getPages();
  const page = pages.find((p) => p.id === numericId);
  return page || null;
};


export const createPage = async (page: Partial<Page>): Promise<Page> => {
  const res = await fetch(`${API_BASE_URL}/pages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(page),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create page");
  }
  return res.json();
};

export const updatePage = async (slug: string, page: Partial<Page>): Promise<{message: string}> => {
  const res = await fetch(`${API_BASE_URL}/pages/${slug}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(page),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update page");
  }
  return res.json();
};