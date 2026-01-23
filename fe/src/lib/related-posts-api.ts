import { API_CONFIG } from '@/constants/app-config';

// Type riêng cho Related Posts
export interface RelatedPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  thumbnail_url: string;
  category_id: number | null;
}

interface RelatedPostsApiResponse {
  category: {
    id: number;
    title: string;
    slug: string;
  };
  posts: RelatedPost[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_posts: number;
    per_page: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

/**
 * Fetch related posts by category slug
 * @param categorySlug - Category slug
 * @param currentPostId - Current post ID to exclude
 * @param limit - Number of posts to fetch (default: 3)
 * @returns Array of related posts
 */
export async function fetchRelatedPostsByCategory(
  categorySlug: string,
  currentPostId: number,
  limit: number = 3
): Promise<RelatedPost[]> {
  try {
    const perPage = limit + 1; // Fetch 1 extra to ensure we have enough after filtering
    const url = `${API_CONFIG.BASE_URL}/categories/${categorySlug}/posts?page=1&per_page=${perPage}`;
    
    console.log('Fetching related posts from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add cache option for better performance
      next: { revalidate: 300 } // Revalidate every 5 minutes
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      console.error(`Failed to fetch related posts: ${response.status}`);
      return [];
    }

    const data: RelatedPostsApiResponse = await response.json();
    console.log('API Response data:', data);

    if (!data || !data.posts || !Array.isArray(data.posts)) {
      console.error('Invalid response structure:', data);
      return [];
    }

    // Filter out current post and limit results
    const filteredPosts = data.posts
      .filter(post => post.id !== currentPostId)
      .slice(0, limit);

    console.log('Filtered posts:', filteredPosts);
    return filteredPosts;

  } catch (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }
}