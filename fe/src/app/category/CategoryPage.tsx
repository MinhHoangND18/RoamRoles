
import React from 'react';
import { notFound } from "next/navigation";
import { fetchCategoryWithPosts } from "@/lib/category-api";
import { CategoryPostsResponse } from '@/types/api';
import { transformContent } from "@/lib/content-utils";
import CategoryContent from '@/app/category/CategoryContent';
import "@/css/all.min.css";

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

const fetchWithRetry = async (
  slug: string,
  page: number = 1,
  maxRetries: number = 3
): Promise<CategoryPostsResponse | null> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await fetchCategoryWithPosts(slug, page);
      if (result) return result;
      return null;
    } catch (error: unknown) {
      if (isApiError(error) && error.status === 404) {
        return null;
      }
      if (i === maxRetries - 1) {
        console.error(`Failed to fetch category "${slug}" after ${maxRetries} attempts`);
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
export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await props.params;

  const data = await fetchWithRetry(slug, 1);

  if (data) {
    return {
      title: getCleanTitle(data.category.title),
    };
  }

  return {
    title: 'Category Not Found',
  };
}

export default async function CategoryPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const currentPage = parseInt(pageParam || '1', 10);

  const data = await fetchWithRetry(slug, currentPage);

  if (!data) {
    notFound();
  }

  return <CategoryContent data={data} slug={slug} currentPage={currentPage} />;
}