import { api } from './api-client';
import { getCategoryPostsEndpoint, getCategoryBySlugEndpoint } from '@/constants/api-endpoints';
import { CategoryPostsResponse, CategoryModel } from '@/types/api';

export async function fetchCategoryWithPosts(
  slug: string,
  page: number = 1
): Promise<CategoryPostsResponse | null> {
  if (!slug || slug === 'undefined') {
    console.error('Invalid slug provided:', slug);
    throw new Error('Invalid category slug');
  }

  try {
    const url = getCategoryPostsEndpoint(slug, page);
    const data: CategoryPostsResponse = await api.get(url, { cache: 'no-store' });

    if (!data || !data.category || !data.posts) {
      return null;
    }

    return data;
  } catch (error: unknown) {
    const status = (error as { status?: number })?.status;

    if (status === 404) {
      return null;
    }

    console.error('Error fetching category posts:', error);
    throw error;
  }
}

export async function fetchCategoryBySlug(slug: string): Promise<CategoryModel | null> {
  try {
    const url = getCategoryBySlugEndpoint(slug);
    const category: CategoryModel = await api.get(url);
    return category;
  } catch (error: unknown) {
    const status = (error as { status?: number })?.status;

    if (status === 404) {
      return null;
    }

    console.error('Error fetching category:', error);
    throw error;
  }
}