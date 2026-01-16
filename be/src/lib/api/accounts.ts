import { Account } from "@/types";

const API_BASE_URL = "http://127.0.0.1:8088/api";

export const getAccountById = async (id: string): Promise<Account> => {
  const res = await fetch(`${API_BASE_URL}/accounts/${id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch account");
  }
  return res.json();
};

export const createAccount = async (account: Partial<Account>): Promise<Account> => {
  const res = await fetch(`${API_BASE_URL}/accounts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(account),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to create account");
  }
  return res.json();
};

export const updateAccount = async (id: string, account: Partial<Account>): Promise<Account> => {
  const res = await fetch(`${API_BASE_URL}/accounts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(account),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to update account");
  }
  return res.json();
};
