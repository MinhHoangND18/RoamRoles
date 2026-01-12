
import { notFound } from "next/navigation";
import "@/css/all.min.css";
import { fetchPostBySlug, fetchAllPosts } from "@/lib/posts-api";
import { PostApiResponse } from '@/types/api';


const transformContent = (content: string) => {
  if (!content) return "";
  let processed = content;
  processed = processed.replace(
    /href="https:\/\/roamroles\.com\/([^"\/]+)\/?"/g,
    'href="/$1"'
  );
  processed = processed.replace(
    /href="https?:\/\/(?!localhost|127\.0\.0\.1)[^"]+"/g,
    'href="#"'
  );
  const wpUploadsRegex =
    /https:\/\/roamroles\.com\/wp-content\/uploads\/(?:sites\/\d+\/)?\d{4}\/\d{2}\//g;

  processed = processed.replace(wpUploadsRegex, "/images/");

  return processed;
};

export async function generateStaticParams() {
  try {
    const posts = await fetchAllPosts();
    console.log('generateStaticParams - posts fetched:', posts?.length || 0);
    if (!posts || !Array.isArray(posts)) {
      console.warn('generateStaticParams - No posts found or invalid response');
      return [];
    }
    const params = posts
      .filter((post) => post && post.slug) 
      .map((post: PostApiResponse) => ({
        slug: post.slug,
      }));
    return params;
  } catch (error) {
    console.error('generateStaticParams - error:', error);
    return [];
  }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const post = await fetchPostBySlug(slug);

  if (!post || !post.slug || post.id === 0) {
    notFound();
  }

  const processedContent = transformContent(post.content);

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: processedContent }} />
    </>
  );
}

export async function generateMetadata(props: { params: { slug: string } }) {
  const resolvedParams = await props.params;
  const post = await fetchPostBySlug(resolvedParams.slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }
}
export const dynamicParams = true;