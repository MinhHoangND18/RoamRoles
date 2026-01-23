'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CategoryPostsResponse } from '@/types/api';
import { transformContent } from "@/lib/content-utils";

interface CategoryContentProps {
    data: CategoryPostsResponse;
    slug: string;
    currentPage: number;
}

export default function CategoryContent({ data, slug, currentPage }: CategoryContentProps) {
    const router = useRouter();
    const { category, posts, pagination } = data;
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        setIsReady(true);
    }, []);

    const handlePageChange = (newPage: number) => {
        router.push(`/category/${slug}?page=${newPage}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Loading spinner overlay
    if (!isReady) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '600px',
                width: '100%'
            }}>
                <div style={{
                    width: '50px',
                    height: '50px',
                    border: '5px solid #f3f3f3',
                    borderTop: '5px solid #482d70',
                    borderRadius: '50%',
                    animation: 'spin 0.2s linear infinite'
                }} />
                <style jsx>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <>
            <main
                id="main"
                className="container py-2 px-lg-5"
                style={{
                    maxWidth: '910px',
                    minHeight: '600px', // ← Prevent layout shift
                    opacity: isReady ? 1 : 0,
                    transition: 'opacity 0.2s ease-in' // ← Smooth fade-in
                }}
            >
                {/* Header */}
                <header className="page-header mb-2">
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
                                        <div className="post-thumbnail p-3">
                                            <a href={`/${post.slug}`}>
                                                <img
                                                    alt={post.title}
                                                    className="w-100"
                                                    style={{
                                                        width: "233px",
                                                        // height: "350px",
                                                        objectFit: "cover",
                                                        borderRadius: "0px"
                                                    }}
                                                    src={`/images/${post.thumbnail_url}`}
                                                    loading="lazy"
                                                />
                                            </a>
                                        </div>
                                    )}

                                    <div className="card-body d-flex flex-column p-3 pt-0">
                                        {/* Title */}
                                        <p className="category-card-title">
                                            <a
                                                href={`/${post.slug}`}
                                                dangerouslySetInnerHTML={{ __html: processedTitle }}
                                                suppressHydrationWarning
                                            />
                                        </p>

                                        {/* Excerpt */}
                                        <div
                                            className="card-text text-muted mb-3 flex-grow-1 category-card-description"
                                            dangerouslySetInnerHTML={{ __html: processedExcerpt }}
                                            suppressHydrationWarning
                                            style={{
                                                fontSize: "0.9rem",
                                                lineHeight: "1.5",
                                                display: "-webkit-box",
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: "vertical",
                                                overflow: "hidden",
                                                textAlign: "left" 
                                            }}
                                        />

                                        {/* Footer */}
                                        <div className="mt-auto text-end">
                                            <a
                                                className="btn btn-outline-secondary btn-sm"
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
            </main>
        </>
    );
}