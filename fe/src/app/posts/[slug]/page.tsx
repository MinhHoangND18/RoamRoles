import { fetchPostBySlug } from '@/lib/posts-api';
import { notFound } from 'next/navigation';
import '@/css/all.min.css';



export default async function PostPage(props: { params: { slug: string } }) {
  const resolvedParams = await props.params;
  const slug = resolvedParams.slug;

  const post = await fetchPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (

          <div dangerouslySetInnerHTML={{ __html: post.content }} />

  );
}


export async function generateMetadata(props: { params: { slug: string } }) {
  const resolvedParams = await props.params;
  const post = await fetchPostBySlug(resolvedParams.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.title,
  };
}