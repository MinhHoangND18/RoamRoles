import { Post } from "@/types/post"

export default function PostCard({ post }: { post: Post }) {
  return (
    <div className="post-card">
      <h3>{post.title}</h3>

      <a href={`/${post.slug}`}>
        Đọc thêm →
      </a>
    </div>
  );
}
