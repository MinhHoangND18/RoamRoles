// API Response types
export interface PostApiResponse {
  id: number;
  slug: string;
  company: string;
  title: string;
  content: string; // JSON string containing JobPost structure
  published_at: string;
}

// Parsed Post from API (content field parsed to JobPost)
export interface PostFromApi {
  id: number;
  slug: string;
  company: string;
  title: string;
  content: string; // Parsed JSON content
  published_at: string;
}

