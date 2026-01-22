export const API_ENDPOINTS = {
  UPLOADS: '/uploads',
  POSTS: '/api',
};

export const getPostBySlugEndpoint = (slug: string) => `/api/posts/${slug}`;
export const getPostsEndpoint = () => `/api/posts`;
export const checkSlugUniquenessEndpoint = (slug: string) => `/api/posts/check-slug?slug=${slug}`;

export const getCategoriesEndpoint = () => `/api/categories`;
export const getCategoryBySlugEndpoint = (slug: string) => `/api/categories/${slug}`;

export const getCategoryPostsEndpoint = (slug: string, page: number = 1) => 
  `/api/categories/${slug}/posts?page=${page}`;