export const API_ENDPOINTS = {
 
  UPLOADS: '/uploads',
  POSTS: '/api',
};

// Helper function to build post endpoints
export const getPostBySlugEndpoint = (slug: string) => `/api/posts/${slug}`;
export const getPostsEndpoint = () => `/api/posts`;