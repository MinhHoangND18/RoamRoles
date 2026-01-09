export interface Post {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  author: string;
  createdAt: string;
  tags?: string[];
}
