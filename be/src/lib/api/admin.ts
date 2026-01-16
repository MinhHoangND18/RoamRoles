import { Post, Account } from "@/types";

const API_BASE_URL = "http://127.0.0.1:8088/api";

export const getPosts = async (): Promise<Post[]> => {
  const res = await fetch(`${API_BASE_URL}/posts`);
  if (!res.ok) {
    throw new Error("Failed to fetch posts");
  }
  const data = await res.json();
  return (
    data.sort((a: Post, b: Post) => {
      const idA = a.id ?? 0;
      const idB = b.id ?? 0;
      return idB - idA;
    }) || []
  );
};

export const getAccounts = async (): Promise<Account[]> => {
  const res = await fetch(`${API_BASE_URL}/accounts`);
  if (!res.ok) {
    throw new Error("Failed to fetch accounts");
  }
  const data = await res.json();
  return data || [];
};
