// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:8088',
  TIMEOUT: 30000, 
};

export const UPLOAD_CONFIG = {
  UPLOAD_URL: process.env.NEXT_PUBLIC_UPLOAD_URL || 'http://localhost:8089',
};

// export const APP_CONFIG = {
//   FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
// };
