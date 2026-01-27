
import React from 'react';
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getBrandData, type Brand } from "@/constants/brands";
import { fetchPageBySlug, fetchAllPages } from "@/lib/pages-api";
import { fetchPostBySlug, fetchAllPosts } from "@/lib/posts-api";
import { PageModel, PostApiResponse } from '@/types/api';
import { transformContent } from "@/lib/content-utils";
import "@/css/all.min.css";
import AdScript from '../ADS/AdScript';
import RelatedPosts from '@/components/RelatedPosts';
import SurveyPopup from '@/components/SurveyPopUp';
import RecommendedPost from '@/components/RecommendPost';


interface ApiError {
  message: string;
  status?: number;
}

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'status' in error
  );
}
const fetchWithRetry = async <T,>(
  fetchFn: (slug: string) => Promise<T | null>,
  slug: string,
  type: 'post' | 'page'
): Promise<T | null> => {
  const maxRetries = 3;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await fetchFn(slug);
      if (result) return result;
      return null;
    } catch (error: unknown) {
      if (isApiError(error) && error.status === 404) {
        return null;
      }
      if (i === maxRetries - 1) {
        console.error(
          `Failed to fetch ${type} "${slug}" after ${maxRetries} attempts`,
        );
        return null;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  return null;
};
const getCleanTitle = (htmlTitle: string | undefined): string => {
  if (!htmlTitle) return "";
  const match = htmlTitle.match(/<span class="gb-headline-text">(.*?)<\/span>/);
  if (match && match[1]) {
    return match[1].replace(/[“”]/g, "").trim();
  }
  return htmlTitle.replace(/<[^>]*>/g, "").trim();
};

export async function generateStaticParams() {
  try {
    const [posts, pages] = await Promise.all([
      fetchAllPosts(),
      fetchAllPages()
    ]);

    const postParams = (Array.isArray(posts) && posts ? posts : [])
      .filter((post) => post?.slug)
      .map((post) => ({ slug: post.slug }));

    const pageParams = (Array.isArray(pages) && pages ? pages : [])
      .filter((page) => page?.slug && page?.status === 'active')
      .map((page) => ({ slug: page.slug }));

    const allParams = [...postParams, ...pageParams];
    console.log(`Generated ${allParams.length} static params (${postParams.length} posts, ${pageParams.length} pages)`);
    return allParams;
  } catch (error) {
    console.error('generateStaticParams error:', error);
    return [];
  }
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const headerList = await headers();
  const host = headerList.get("host");
  const brand = getBrandData(host);

  // Try Post first
  const post = await fetchWithRetry<PostApiResponse>(fetchPostBySlug, slug, 'post');
  if (post) {
    return {
      title: getCleanTitle(post.title),
    };
  }

  // Try Page
  const page = await fetchWithRetry<PageModel>(fetchPageBySlug, slug, 'page');
  if (page) {
    return {
      title: `${page.title} - ${brand.name}`,
      description: page.title || `${page.title} on ${brand.name}`,
    };
  }

  return {
    title: `Not Found - ${brand.name}`,
  };
}

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const headerList = await headers();
  const host = headerList.get("host");
  const brand = getBrandData(host);
  const post = await fetchWithRetry<PostApiResponse>(fetchPostBySlug, slug, 'post');
  if (post && post.slug && post.id !== 0) {
    return <PostContent post={post} />;
  }

  // Try fetching Page
  const page = await fetchWithRetry<PageModel>(fetchPageBySlug, slug, 'page');
  if (page && page.status === 'active') {
    return <PageContent page={page} brand={brand} />;
  }

  notFound();
}


function PostContent({ post }: { post: PostApiResponse }) {
  const processedTitle = transformContent(post.title || "");
  const rawExcerpt = transformContent(post.excerpt || "");
  const processedContent = transformContent(post.content || "");
  const processedNav = transformContent(post.post_navigation || "");


  const upperExcerptMatch = rawExcerpt.match(/<h6[^>]*>[\s\S]*?<\/h6>/i);
  const upperExcerpt = upperExcerptMatch ? upperExcerptMatch[0] : "";

  const lowerExcerptMatch = rawExcerpt.match(/<div class="entry-excerpt"[^>]*>[\s\S]*?<\/div>/i);
  const lowerExcerpt = lowerExcerptMatch ? lowerExcerptMatch[0] : "";

  const fallbackExcerpt = !upperExcerpt && !lowerExcerpt ? rawExcerpt : "";


  return (
    <>
      {post.show_survey && <SurveyPopup key={post.id} />}
      <main id="main" className="container">
        <AdScript />


        <div className="row">
          <div className="col-md-8 col-sm-12 offset-md-2" suppressHydrationWarning>
            <article className="post-wrapper">
              <header className="entry-header mb-4 text-center d-flex flex-column align-items-center">

                {/* EXCERPT TRÊN TITLE */}
                {upperExcerpt && (
                  <div
                    className="upper-excerpt-wrapper mb-2 w-100"
                    style={{ textAlign: 'center' }}
                    dangerouslySetInnerHTML={{ __html: upperExcerpt }}
                  />
                )}

                {/* TITLE CHÍNH */}
                {processedTitle && (
                  <div
                    className="post-header-title w-100 text-center"
                    dangerouslySetInnerHTML={{ __html: processedTitle }}
                  />
                )}

                {/* EXCERPT DƯỚI TITLE */}
                {lowerExcerpt && (
                  <div
                    className="lower-excerpt-wrapper mt-3 w-100"
                    style={{ textAlign: 'center' }}
                    dangerouslySetInnerHTML={{ __html: lowerExcerpt }}
                  />
                )}
                {fallbackExcerpt && (
                  <div
                    className="mt-3"
                    dangerouslySetInnerHTML={{ __html: fallbackExcerpt }}
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
            <RecommendedPost postId={post.id} />

            {post.category_id && (
              <>
                <hr className="mt-5" />
                <RelatedPosts currentPost={post} />
              </>
            )}

            {processedNav && (
              <>
                <hr className="mt-5" />
                <div dangerouslySetInnerHTML={{ __html: processedNav }} />
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

function PageContent({ page, brand }: { page: PageModel; brand: Brand }) {
  const processedContent = transformContent(page.content || "");

  return (
    <main id="main" className="container">
      <div
        id={`post-${page.id}`}
        className={`content post-${page.id} page type-page status-publish hentry`}
      >
        <p style={{ margin: '30px' }} className="gb-headline gb-headline-ebd47fe1">
          <span className="gb-icon">
            <svg viewBox="0 0 36.7 3" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0h36.7v3H0z"></path>
            </svg>
          </span>
          <span className="gb-headline-text">
            {getCleanTitle(page.title)}
          </span>
        </p>

        <div
          className="page-content"
          dangerouslySetInnerHTML={{ __html: processedContent }}
          suppressHydrationWarning
        />
      </div>
    </main>
  );
}