import { API_CONFIG } from '@/constants/app-config';
import { PostApiResponse } from '@/types/api';

/**
 * Fetch related posts by post ID
 * Sử dụng endpoint mới /api/posts/{id}/related
 * 
 * @param postId - ID của bài viết hiện tại
 * @param limit - Số lượng bài viết muốn lấy (mặc định: 3)
 * @returns Array of related posts
 */
export async function fetchRelatedPostsByPostId(
  postId: number,
  limit: number = 3
): Promise<PostApiResponse[]> {
  try {
    const url = `${API_CONFIG.BASE_URL}/api/posts/${postId}/related?limit=${limit}`;
    
    console.log('Fetching related posts from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 0 } 
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      console.error(`Failed to fetch related posts: ${response.status}`);
      return [];
    }

    const data: PostApiResponse[] = await response.json();
    
    if (!Array.isArray(data)) {
      console.error('Invalid response structure:', data);
      return [];
    }

    console.log('Related posts fetched:', data);
    return data;

  } catch (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }
}

export async function fetchRelatedPostsByCategory(
  categorySlug: string,
  currentPostId: number,
  limit: number = 3
): Promise<PostApiResponse[]> {
  try {
    const perPage = limit + 1;
    const url = `${API_CONFIG.BASE_URL}/categories/${categorySlug}/posts?page=1&per_page=${perPage}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    if (!data || !data.posts || !Array.isArray(data.posts)) {
      return [];
    }

    return data.posts
      .filter((post: PostApiResponse) => post.id !== currentPostId)
      .slice(0, limit);

  } catch (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }
}