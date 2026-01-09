export const API_ENDPOINTS = {
  AUTH: '/auth',
  USERS: '/users',
  CUSTOMERS: '/customers',
  STORES: '/stores',
  SERVICES: '/services',
  SERVICE_CATEGORIES: '/service-categories',
  BOOKINGS: '/bookings',
  BOOKING_ORDER: '/bookings/order',
  INVOICES: '/invoices',
  PAYMENTS: '/payments',
  PROMOTIONS: '/promotions',
  REPORTS: '/reports',
  PERMISSIONS: '/permissions',
  STAFF: '/staff',
  UPLOADS: '/uploads',
  POSTS: '/api/posts',
};

// Helper function to build post endpoints
export const getPostBySlugEndpoint = (slug: string) => `${API_ENDPOINTS.POSTS}/${slug}`;