import { api } from './api-client';
import { getPostBySlugEndpoint } from '@/src/constants/api-endpoints';
import { PostApiResponse } from '@/src/types/api';
import { JobPost } from '@/src/types/jobPost';

/**
 * Fetch a post by slug from the API
 */
export async function fetchPostBySlug(slug: string): Promise<JobPost | null> {
  try {
    const response = await api.get<PostApiResponse>(getPostBySlugEndpoint(slug));
    
    // Parse the content JSON field
    let content: JobPost;
    try {
      content = typeof response.content === 'string' 
        ? JSON.parse(response.content) 
        : response.content;
    } catch (error) {
      console.error('Error parsing post content:', error);
      return null;
    }

    return content;
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
export async function fetchAllPosts() {
  try {
    // This is a placeholder - implement when you have the endpoint
    const response = await api.get<any>('/api/posts');
    return response;
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}

