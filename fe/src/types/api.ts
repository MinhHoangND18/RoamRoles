export interface TypeModel {
  id: number;
  name: string;
}

export interface CategoryModel {
  id: number;
  name: string;
  slug?: string;
}

export interface PostApiResponse {
  id: number;
  slug: string;
  content: string;
  descrip: string;
  title: string;
  title_header: string;
  excerpt: string;
  post_navigation: string;
  status: string;
  type_id: number;
  type: TypeModel;
  category_id: number | null;
  category: CategoryModel | null;
}

export interface PageModel {
  id: number;
  slug: string;
  title: string;
  title_header: string;
  content: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}