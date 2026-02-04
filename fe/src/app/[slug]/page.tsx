import React from "react";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getBrandData, type Brand } from "@/constants/brands";
import { fetchPageBySlug, fetchAllPages } from "@/lib/pages-api";
import { fetchPostBySlug, fetchAllPosts } from "@/lib/posts-api";
import { PageModel, PostApiResponse } from "@/types/api";
import { transformContent } from "@/lib/content-utils";
import "@/css/all.min.css";
import AdScript from "../ADS/AdScript";
import RelatedPosts from "@/components/RelatedPosts";
import SurveyPopup from "@/components/SurveyPopUp";
import RecommendedPost from "@/components/RecommendPost";
import JobBoxRenderer from "@/components/JobBoxRenderer";
import { getReusableBlockById } from "@/lib/reusable_blocks";
import { ReusableBlock } from "@/types/ReusableBlock";

interface ApiError {
  message: string;
  status?: number;
}

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    "status" in error
  );
}

const fetchWithRetry = async <T,>(
  fetchFn: (slug: string) => Promise<T | null>,
  slug: string,
  type: "post" | "page",
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

type ContentPart =
  | { type: "text"; content: string }
  | { type: "block"; data: ReusableBlock };

async function ContentParser({ htmlContent }: { htmlContent: string }) {
  const processedHtml = htmlContent.replace(
    /<p>\s*(\[block id="\d+"\])\s*<\/p>/g,
    "$1",
  );

  const regex = /\[block id="(\d+)"\]/g;
  const parts: ContentPart[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(processedHtml)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: processedHtml.substring(lastIndex, match.index),
      });
    }

    const blockId = parseInt(match[1]);
    const blockData = await getReusableBlockById(blockId);

    if (blockData) {
      if (blockData.status === "active") {
        parts.push({ type: "block", data: blockData });
      } else {
        parts.push({ type: "text", content: match[0] });
      }
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < processedHtml.length) {
    parts.push({ type: "text", content: processedHtml.substring(lastIndex) });
  }

  return (
    <>
      {parts.map((part, index) => {
        if (part.type === "text") {
          return (
            <div
              key={index}
              style={{ display: "contents" }} 
              dangerouslySetInnerHTML={{ __html: part.content || "" }}
            />
          );
        }
        return (
          <div
            key={index}
            className="w-100 my-4 clear-both"
            suppressHydrationWarning={true}
          >
            <JobBoxRenderer block={part.data!} />
          </div>
        );
      })}
    </>
  );
}

export async function generateStaticParams() {
  try {
    const [posts, pages] = await Promise.all([
      fetchAllPosts(),
      fetchAllPages(),
    ]);

    const postParams = (Array.isArray(posts) && posts ? posts : [])
      .filter((post) => post?.slug)
      .map((post) => ({ slug: post.slug }));

    const pageParams = (Array.isArray(pages) && pages ? pages : [])
      .filter((page) => page?.slug && page?.status === "active")
      .map((page) => ({ slug: page.slug }));

    return [...postParams, ...pageParams];
  } catch (error) {
    return [];
  }
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const headerList = await headers();
  const host = headerList.get("host");
  const brand = getBrandData(host);

  const post = await fetchWithRetry<PostApiResponse>(
    fetchPostBySlug,
    slug,
    "post",
  );
  if (post) return { title: getCleanTitle(post.title) };

  const page = await fetchWithRetry<PageModel>(fetchPageBySlug, slug, "page");
  if (page) return { title: getCleanTitle(page.title) };

  return { title: `Not Found - ${brand.name}` };
}

const getPlainText = (html: string): string => {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
};

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const headerList = await headers();
  const host = headerList.get("host");
  const brand = getBrandData(host);

  const post = await fetchWithRetry<PostApiResponse>(
    fetchPostBySlug,
    slug,
    "post",
  );
  if (post && post.slug && post.id !== 0) {
    return <PostContent post={post} host={host} />;
  }

  const page = await fetchWithRetry<PageModel>(fetchPageBySlug, slug, "page");
  if (page && page.status === "active") {
    return <PageContent page={page} brand={brand} host={host} />;
  }

  notFound();
}

function PostContent({
  post,
  host,
}: {
  post: PostApiResponse;
  host: string | null;
}) {
  const cleanTitle = getPlainText(post.title || "");
  const rawExcerpt = transformContent(post.excerpt || "");
  const processedContent = transformContent(post.content || "");
  const processedNav = transformContent(post.post_navigation || "");

  const upperExcerptMatch = rawExcerpt.match(/<h6[^>]*>[\s\S]*?<\/h6>/i);
  const upperExcerpt = upperExcerptMatch ? upperExcerptMatch[0] : "";

  const lowerExcerptMatch = rawExcerpt.match(
    /<div class="entry-excerpt"[^>]*>[\s\S]*?<\/div>/i,
  );
  const lowerExcerpt = lowerExcerptMatch ? lowerExcerptMatch[0] : "";

  const fallbackExcerpt = !upperExcerpt && !lowerExcerpt ? rawExcerpt : "";

  return (
    <>
      {post.survey_set_id && post.status === "active" && (
        <SurveyPopup surveySetId={post.survey_set_id} postId={post.id} />
      )}
      <main id="main" className="container">
        <AdScript key={post.id} />
        <div className="row">
          <div className="col-md-8 col-sm-12 offset-md-2">
            <article className="d-block py-3 mx-auto">
              <header className="entry-header mb-4 text-center d-flex flex-column align-items-center">
                {upperExcerpt && (
                  <div
                    className="upper-excerpt-wrapper mb-2 w-100"
                    style={{ textAlign: "center" }}
                    dangerouslySetInnerHTML={{ __html: upperExcerpt || "" }}
                  />
                )}

                {cleanTitle && (
                  <h4 className="w-100 text-center mb-4">{cleanTitle}</h4>
                )}

                {lowerExcerpt && (
                  <div
                    className="lower-excerpt-wrapper mt-3 w-100"
                    style={{ textAlign: "center" }}
                    dangerouslySetInnerHTML={{ __html: lowerExcerpt || "" }}
                  />
                )}

                {fallbackExcerpt && (
                  <div
                    className="mt-3"
                    dangerouslySetInnerHTML={{ __html: fallbackExcerpt || "" }}
                  />
                )}

                <div
                  className="advertisement"
                  style={{
                    marginBottom: "15px",
                    width: "100%",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      fontSize: "10px",
                      textAlign: "center",
                      marginBottom: "5px",
                    }}
                  >
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

              <div className="entry-content mt-5">
                <ContentParser htmlContent={processedContent} />
              </div>
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
                <div dangerouslySetInnerHTML={{ __html: processedNav || "" }} />
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

function PageContent({
  page,
  brand,
  host,
}: {
  page: PageModel;
  brand: Brand;
  host: string | null;
}) {
  const processedContent = transformContent(page.content || "", host);

  return (
    <main id="main" className="container">
      <div
        id={`post-${page.id}`}
        className={`content post-${page.id} page type-page status-publish hentry`}
      >
        <p
          style={{ margin: "30px" }}
          className="gb-headline gb-headline-ebd47fe1"
        >
          <span className="gb-icon">
            <svg viewBox="0 0 36.7 3" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0h36.7v3H0z"></path>
            </svg>
          </span>
          <span className="gb-headline-text">{getCleanTitle(page.title)}</span>
        </p>

        <div className="page-content">
          <ContentParser htmlContent={processedContent} />
        </div>
      </div>
    </main>
  );
}