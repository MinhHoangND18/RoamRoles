import { api } from './api-client';
import { getPostBySlugEndpoint, getPostsEndpoint } from '@/constants/api-endpoints';
import { PostApiResponse } from '@/types/api';

export async function fetchPostBySlug(slug: string): Promise<PostApiResponse | null> {
  try {
    const url = getPostBySlugEndpoint(slug);
    console.log('fetchPostBySlug - fetching URL:', url);
    const post: PostApiResponse = await api.get(url);
    console.log('fetchPostBySlug - received post:', post ? { id: post.id, slug: post.slug } : 'null');

    if (!post) {
      return null;
    }
    return post;
  } catch (error: unknown) {
    console.error('Error fetching post:', error);
    console.error('Error details - slug:', slug, 'status:', (error as { status?: number })?.status);

    if ((error as { status?: number })?.status === 404) {
      return null;
    }

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
