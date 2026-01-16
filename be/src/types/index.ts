export interface Type {
  id: number;
  type_name: string;
  slug: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Post {
  id?: number;
  title: string;
  title_header?: string;
  excerpt: string;
  descrip: string;
  content: string;
  status: string;
  slug: string;
  type_id: number;
  type?: Type;
  category_id?: number | null;
  category?: Category | null;
}

export interface Account {
  id: number;
  account: string;
  status: string;
}
