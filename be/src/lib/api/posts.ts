import { Post, Type, Category } from "@/types";

const API_BASE_URL = "http://127.0.0.1:8088/api";

export const getTypes = async (): Promise<Type[]> => {
  const res = await fetch(`${API_BASE_URL}/types`);
  if (!res.ok) {
    throw new Error("Failed to fetch types");
  }
  return res.json();
};

export const getCategories = async (): Promise<Category[]> => {
  const res = await fetch(`${API_BASE_URL}/categories`);
  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }
  return res.json();
};

export const checkSlugUniqueness = async (slug: string): Promise<{ exists: boolean }> => {
  const response = await fetch(`${API_BASE_URL}/posts/check-slug?slug=${slug}`);
  if (!response.ok) {
    // If the API fails, assume the slug is not unique to be safe, or handle as needed
    return { exists: true };
  }
  return response.json();
};

export const getPostBySlug = async (slug: string, type?: string | null): Promise<Post> => {
    const url = type
    ? `${API_BASE_URL}/posts/${slug}?type=${type}`
    : `${API_BASE_URL}/posts/${slug}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch post");
  }
  return res.json();
};

export const createPost = async (post: Partial<Post>): Promise<Post> => {
  const res = await fetch(`${API_BASE_URL}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(post),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to create post");
  }
  return res.json();
};

export const updatePost = async (slug: string, post: Partial<Post>): Promise<Post> => {
  const res = await fetch(`${API_BASE_URL}/posts/${slug}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(post),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to update post");
  }
  return res.json();
};
