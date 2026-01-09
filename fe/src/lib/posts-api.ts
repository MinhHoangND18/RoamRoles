import { api } from './api-client';
import { getPostBySlugEndpoint } from '@/constants/api-endpoints';
import { PostApiResponse } from '@/types/api';

/**
 * Fetch a post by slug from the API
 */
export async function fetchPostBySlug(slug: string): Promise<PostApiResponse | null> {
  try {
    const url = getPostBySlugEndpoint(slug);
    const post: PostApiResponse = await api.get(url);

    if (!post) {
      return null;
    }

    // Return the post object directly from the API
    return post;
  } catch (error: any) {
    console.error('Error fetching post:', error);
    
    // Handle 404 specifically
    if (error.status === 404) {
      return null;
    }
    
    throw error;
  }
}

/**
 * Fetch all posts (if you have this endpoint later)
 */
export async function fetchAllPosts(): Promise<PostApiResponse[] | null> {
  try {
    // This is a placeholder - implement when you have the endpoint
    const response = await api.get<PostApiResponse[]>('/api/posts');
    return response;
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}

