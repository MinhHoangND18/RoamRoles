'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CategoryPostsResponse } from '@/types/api';
import { transformContent } from "@/lib/content-utils";
import "@/css/all.min.css";

interface CategoryContentProps {
    data: CategoryPostsResponse;
    slug: string;
    currentPage: number;
}

export default function CategoryContent({ data, slug, currentPage }: CategoryContentProps) {
    const router = useRouter();
    const { category, posts, pagination } = data;

    const handlePageChange = (newPage: number) => {
        router.push(`/category/${slug}?page=${newPage}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <main id="main" className="container py-4 px-lg-5">
            {/* Header */}
            <header className="page-header mb-5">
                <p className="entry-title gb-headline gb-headline-ebd47fe1">
                    <span className="gb-headline-text">See more on: {category.title}</span>
                    <span className="gb-icon">
                        <svg viewBox="0 0 36.7 3" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 0h36.7v3H0z"></path>
                        </svg>
                    </span>
                </p>
            </header>

            {/* Posts Grid */}
            <div className="row">
                {posts.map((post) => {
                    const processedTitle = transformContent(post.title || "");
                    const processedExcerpt = transformContent(post.excerpt || "");

                    return (
                        <article
                            key={post.id}
                            className={`col-lg-4 col-md-6 mb-4 post-${post.id} post type-post status-publish format-standard has-post-thumbnail hentry category-${category.slug}`}
                            id={`post-${post.id}`}
                        >
                            <div className="card h-100 shadow-sm">
                                {/* Thumbnail */}
                                {post.thumbnail_url && (
                                    <div className="post-thumbnail">
                                        <a href={`/${post.slug}`}>
                                            <img
                                                alt={post.title}
                                                className="card-img-top"
                                                style={{ height: "200px", objectFit: "cover" }}
                                                src={`/images/${post.thumbnail_url}`}
                                                loading="lazy"
                                            />
                                        </a>
                                    </div>
                                )}

                                <div className="card-body d-flex flex-column p-3">
                                    {/* Title */}
                                    <h5
                                        className="card-title mb-2"
                                        dangerouslySetInnerHTML={{ __html: processedTitle }}
                                        suppressHydrationWarning
                                        style={{
                                            fontSize: "1.1rem",
                                            lineHeight: "1.4",
                                            display: "-webkit-box",
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical",
                                            overflow: "hidden"
                                        }}
                                    />

                                    {/* Excerpt */}
                                    <div
                                        className="card-text text-muted mb-3 flex-grow-1"
                                        dangerouslySetInnerHTML={{ __html: processedExcerpt }}
                                        suppressHydrationWarning
                                        style={{
                                            fontSize: "0.9rem",
                                            lineHeight: "1.5",
                                            display: "-webkit-box",
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: "vertical",
                                            overflow: "hidden"
                                        }}
                                    />

                                    {/* Footer */}
                                    <div className="mt-auto">
                                        <a
                                            className="btn btn-outline-secondary btn-sm w-100"
                                            href={`/${post.slug}`}
                                        >
                                            See More
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
                <nav className="pagination-nav mt-5" aria-label="Posts navigation">
                    <div className="d-flex justify-content-between align-items-center">
                        {/* Older Posts Button */}
                        <div>
                            {pagination.has_next ? (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handlePageChange(pagination.current_page + 1)}
                                >
                                    ← Older Posts
                                </button>
                            ) : (
                                <div></div>
                            )}
                        </div>

                        {/* Page Info */}
                        <div className="text-muted">
                            Page {pagination.current_page} of {pagination.total_pages}
                        </div>

                        {/* Newer Posts Button */}
                        <div>
                            {pagination.has_prev ? (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handlePageChange(pagination.current_page - 1)}
                                >
                                    Newer Posts →
                                </button>
                            ) : (
                                <div></div>
                            )}
                        </div>
                    </div>
                </nav>
            )}

            {/* <style jsx>{`
        .page-header {
          border-bottom: 3px solid #333;
          padding-bottom: 20px;
        }
        
        .gb-headline {
          margin: 0;
          font-size: 2rem;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .gb-headline-text {
          color: #333;
        }
        
        .gb-icon svg {
          width: 40px;
          height: 3px;
          fill: #333;
        }
        
        .card {
          border: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.2s;
        }
        
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .post-thumbnail {
          overflow: hidden;
          border-radius: 8px;
        }
        
        .post-thumbnail img {
          width: 100%;
          height: 200px;
          object-fit: cover;
          transition: transform 0.3s;
        }
        
        .post-thumbnail:hover img {
          transform: scale(1.05);
        }
        
        .card-title {
          font-size: 1.25rem;
          margin-bottom: 15px;
        }
        
        .card-title a {
          color: #333;
          text-decoration: none;
          transition: color 0.2s;
        }
        
        .card-title a:hover {
          color: #0066cc;
        }
        
        .entry-content {
          color: #666;
          font-size: 0.95rem;
          line-height: 1.6;
        }
        
        .entry-content p {
          margin-bottom: 0;
        }
        
        .pagination-nav {
          padding: 30px 0;
          border-top: 1px solid #dee2e6;
        }
        
        .btn-primary {
          background-color: #0066cc;
          border-color: #0066cc;
          padding: 10px 20px;
          font-weight: 500;
        }
        
        .btn-primary:hover {
          background-color: #0052a3;
          border-color: #0052a3;
        }
      `}</style> */}
        </main>
    );
}