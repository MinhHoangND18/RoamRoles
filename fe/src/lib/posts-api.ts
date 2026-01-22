import { api } from './api-client';
import { getPostBySlugEndpoint, getPostsEndpoint } from '@/constants/api-endpoints';
import { PostApiResponse } from '@/types/api';

export async function fetchPostBySlug(slug: string): Promise<PostApiResponse | null> {
  try {
    const url = getPostBySlugEndpoint(slug);
    const post: PostApiResponse = await api.get(url);
    return post || null;
  } catch (error: unknown) {
    const status = (error as { status?: number })?.status;

    if (status === 404) {
      return null;
    }

    console.error('Error fetching post:', error);
    throw error;
  }
}


export async function fetchAllPosts(): Promise<PostApiResponse[] | null> {
  try {
    const url = getPostsEndpoint();
    const posts: PostApiResponse[] = await api.get(url);
    return posts;
  } catch (error: unknown) {
    console.error('Error fetching posts:', error);
    return null;
  }
}
