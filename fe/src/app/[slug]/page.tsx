import { notFound } from "next/navigation";
import "@/css/all.min.css";
import { fetchPostBySlug, fetchAllPosts } from "@/lib/posts-api";
import { PostApiResponse } from '@/types/api';
import AdScript from '../ADS/AdScript';
import { transformContent } from "@/lib/content-utils";

const fetchPostWithRetry = async (slug: string) => {
  const maxRetries = 3;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetchPostBySlug(slug);
    } catch (error) {
      if (i === maxRetries - 1) console.error(`Failed to fetch ${slug} after ${maxRetries} attempts`);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }
  return null;
};

export async function generateStaticParams() {
  try {
    const posts = await fetchAllPosts();
    if (!posts || !Array.isArray(posts)) {
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
export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const post = await fetchPostWithRetry(slug);

  if (!post) return { title: "Post Not Found" };

  return {
    title: post.title_header || post.slug.split('-').join(' ').toUpperCase(),
  };
}


export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await fetchPostWithRetry(slug);

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
      <AdScript />
      <div className="row">
        <div className="col-md-8 col-sm-12 offset-md-2" suppressHydrationWarning>

          <article className="post-wrapper">
            <header className="entry-header mb-4 text-center">
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
                  className="mt-3"
                  dangerouslySetInnerHTML={{ __html: processedExcerpt }}
                />
              )}
              <div className="advertisement" style={{ marginBottom: "15px" }}>
                <p style={{
                  fontSize: "10px",
                  textAlign: "center",
                  marginBottom: "5px"
                }}>
                  Advertisement
                </p>
                <div
                  className="ad-place"
                  se="__element"
                  data-ad-sizes="responsive"
                  data-fluid="false"
                  data-fit-size="true"
                  data-ad-mode="adsense"
                ></div>
              </div>
            </header>

            <div
              className="entry-content mt-5"
              dangerouslySetInnerHTML={{ __html: processedContent }}
            />
          </article>

          {processedNav && (
            <>
              <hr className="mt-5" />
              <div dangerouslySetInnerHTML={{ __html: processedNav }} />
            </>
          )}

        </div>
      </div>
    </main>
  );
}


// export const dynamicParams = true;