import { API_CONFIG } from '@/constants/app-config';
import { PageModel } from '@/types/api';

export async function fetchAllPages(): Promise<PageModel[]> {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/pages`, {
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch pages: ${response.status}`);
    }

    const pages = await response.json();
    return pages;
  } catch (error) {
    console.error('Error fetching pages:', error);
    return [];
  }
}

export async function fetchPageBySlug(slug: string): Promise<PageModel | null> {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/pages/${slug}`, {
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch page: ${response.status}`);
    }

    const page = await response.json();
    return page;
  } catch (error) {
    console.error(`Error fetching page ${slug}:`, error);
    return null;
  }
}
