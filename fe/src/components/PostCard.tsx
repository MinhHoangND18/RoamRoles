import Link from "next/link";
import { Post } from "@/types/post"

export default function PostCard({ post }: { post: Post }) {
  return (
    <div className="post-card">
      <h3>{post.title}</h3>

      <Link href={`/${post.slug}`}>
        Đọc thêm →
      </Link>
    </div>
  );
}
