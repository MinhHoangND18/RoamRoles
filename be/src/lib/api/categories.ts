import { API_CONFIG } from "./config";
import { Category } from "@/types";

const API_BASE = `${API_CONFIG.BASE_URL}/api/categories`;

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(API_BASE, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function getCategoryBySlug(slug: string): Promise<Category> {
  const res = await fetch(`${API_BASE}/${slug}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Category not found");
  return res.json();
}

export async function saveCategory(data: Category, id?: number): Promise<Category> {
  const url = id ? `${API_BASE}/handle/${id}` : `${API_BASE}/handle`;

  const payload = {
    id: data.id,
    title: data.title,
    slug: data.slug,
    status: data.status,
  };
  
  const res = await fetch(url, {
    method: "POST", 
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to save category");
  }

  return res.json();
}