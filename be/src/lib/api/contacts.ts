import { Contact } from "@/types";
import { API_CONFIG } from "@/lib/api/config";

const API_BASE_URL = `${API_CONFIG.BASE_URL}/api`;

export const getContacts = async (): Promise<Contact[]> => {
    const res = await fetch(`${API_BASE_URL}/contacts`, {
        cache: "no-store",
    });
    if (!res.ok) {
        throw new Error("Failed to fetch contacts");
    }
    return res.json();
};

export const updateContactStatus = async (id: number, status: "pending" | "contacted"): Promise<Contact> => {
    const res = await fetch(`${API_BASE_URL}/contacts/${id}/status`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
    });
    if (!res.ok) {
        throw new Error("Failed to update contact status");
    }
    return res.json();
};
