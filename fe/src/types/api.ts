export interface TypeModel {
  id: number;
  name: string;
}

export interface CategoryModel {
  id: number;
  title: string;
  slug: string;
  status: "active" | "inactive";
  created_at: string;
}

export interface PostApiResponse {
  id: number;
  slug: string;
  content: string;
  title: string;
  excerpt: string;
  post_navigation: string;
  thumbnail_url: string;
  status: 'active' | 'inactive' | 'draft';
  type_id: number;
  type: TypeModel;
  category_id: number | null;
  category: CategoryModel | null;
  created_at: string;
  survey_set_id?: number | null;
}

export interface PageModel {
  id: number;
  slug: string;
  title: string;
  content: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export interface PaginationMeta {
  current_page: number;
  total_pages: number;
  total_posts: number;
  per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface CategoryPostsResponse {
  category: CategoryModel;
  posts: PostApiResponse[];
  pagination: PaginationMeta;
}