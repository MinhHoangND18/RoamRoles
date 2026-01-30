import { API_CONFIG } from "@/constants/app-config";
import { ReusableBlock } from "@/types/ReusableBlock";


export const getReusableBlocks = async (): Promise<ReusableBlock[]> => {
  const res = await fetch(`${API_BASE_URL}/reusable-blocks`);
  if (!res.ok) {
    throw new Error("Failed to fetch reusable blocks");
  }
  return res.json();
};
export const getReusableBlockById = async (
  id: number,
): Promise<ReusableBlock> => {
  const res = await fetch(`${API_BASE_URL}/reusable-blocks/${id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch reusable block");
  }
  return res.json();
};
const BASE_URL_CLEAN = API_CONFIG.BASE_URL.endsWith('/') 
  ? API_CONFIG.BASE_URL.slice(0, -1) 
  : API_CONFIG.BASE_URL;

const API_BASE_URL = `${BASE_URL_CLEAN}/api`;

export const createOrUpdateReusableBlock = async (block: ReusableBlock) => {
  const endpoint = block.id && block.id !== 0
    ? `reusable-blocks/handle/${block.id}` 
    : `reusable-blocks/handle`;

  // Sử dụng API_BASE_URL đã được làm sạch
  const url = `${API_BASE_URL}/${endpoint}`;

  console.log("Final URL Check:", url); 

  const res = await fetch(url, {
    method: "POST", 
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(block),
  });
  
  if (!res.ok) throw new Error("Failed to save");
  return res.json();
};
export const updateReusableBlock = async (
  id: number,
  block: ReusableBlock,
): Promise<{ message: string; id: number }> => {
  const res = await fetch(`${API_BASE_URL}/reusable-blocks/handle/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(block),
  });
  if (!res.ok) {
    throw new Error("Failed to update reusable block");
  }
  return res.json();
};