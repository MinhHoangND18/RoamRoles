export interface Type {
  id: number;
  type_name: string;
  slug: string;
}

export interface Category {
  id: number;
  title: string;
  slug: string;
  status: "active" | "inactive";
}


export interface Post {
  id: number;
  title: string;
  excerpt: string;
  descrip: string;
  content: string;
  status: string;
  slug: string;
  type_id: number;
  post_navigation: string;
  type?: Type;
  category_id?: number | null;
  category?: Category | null;
  recommend_post_id?: number | null;
  thumbnail_url?: string;
  // show_survey: boolean;
  survey_set_id?: number | null;

}

export interface Account {
  id: number;
  account: string;
  status: string;
}

export interface Page {
  id: number;
  slug: string;
  title: string;
  content: string;
  status: "active" | "inactive";
}

export interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  message: string;
  status: string;
  ip: string;
  referer?: string;
  domain?: string;
  created_at?: string;
}
