export const API_ENDPOINTS = {
 
  UPLOADS: '/uploads',
  POSTS: '/api',
};

// Helper function to build post endpoints
export const getPostBySlugEndpoint = (slug: string) => `${API_ENDPOINTS.POSTS}/${slug}`;
export const getPostsEndpoint = () => `${API_ENDPOINTS.POSTS}`;