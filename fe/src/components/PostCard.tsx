import Link from "next/link";
import { Post } from "@/src/types/post"

export default function PostCard({ post }: { post: Post }) {
  return (
    <div className="post-card">
      <h3>{post.title}</h3>
      <p>{post.description}</p>

      <Link href={`/posts/${post.slug}`}>
        Đọc thêm →
      </Link>
    </div>
  );
}
