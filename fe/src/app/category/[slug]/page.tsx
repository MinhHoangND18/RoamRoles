import { notFound } from "next/navigation";
import "@/css/all.min.css";
import { fetchPostBySlug, fetchAllPosts } from "@/lib/posts-api";
import { PostApiResponse } from '@/types/api';
import DisableAds from './DisableAds';

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

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const post = await fetchPostBySlug(slug);

  if (!post) return { title: "Post Not Found" };

  return {
    title: post.title_header || post.slug.split('-').join(' ').toUpperCase(), 
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await fetchPostBySlug(slug);

  if (!post || !post.slug || post.id === 0) {
    notFound();
  }

  const processedDescrip = transformContent(post.descrip || "");
  const processedTitle = transformContent(post.title || "");
  const processedExcerpt = transformContent(post.excerpt || "");
  const processedContent = transformContent(post.content || "");
  const processedNav = transformContent(post.post_navigation || "");

  return (
    <main id="main" className="container">
      <DisableAds />
      <div className="row">
        <div className="col-md-8 col-sm-12 offset-md-2" suppressHydrationWarning>
          
          <article className="post-wrapper">
            <header className="entry-header text-center">
              {processedDescrip && (
                <div 
                  className="mb-2" 
                  dangerouslySetInnerHTML={{ __html: processedDescrip }} 
                />
              )}

              {processedTitle && (
                <div 
                  className="post-header-title" 
                  dangerouslySetInnerHTML={{ __html: processedTitle }} 
                />
              )}

              {processedExcerpt && (
                <div 
                  dangerouslySetInnerHTML={{ __html: processedExcerpt }} 
                />
              )}
            </header>

            <div 
              className="entry-content"
              dangerouslySetInnerHTML={{ __html: processedContent }} 
            />
          </article>

          {processedNav && (
            <footer className="post-footer">
              <hr className="my-5" />
              <div dangerouslySetInnerHTML={{ __html: processedNav }} />
            </footer>
          )}
        </div>
      </div>
    </main>
  );
}

export const dynamicParams = true;