'use client';

import React, { useEffect, useState } from 'react';
import { PostApiResponse } from '@/types/api';
import { transformContent } from "@/lib/content-utils";
import { fetchRelatedPostsByCategory, type RelatedPost } from '@/lib/related-posts-api';

interface RelatedPostsProps {
  currentPost: PostApiResponse;
}

export default function RelatedPosts({ currentPost }: RelatedPostsProps) {
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRelatedPosts = async () => {
      // Debug logs
      console.log('RelatedPosts - Current Post:', currentPost);
      console.log('Category ID:', currentPost.category_id);
      console.log('Category Slug:', currentPost.category?.slug);

      // Check if post has category
      if (!currentPost.category_id || !currentPost.category?.slug) {
        console.log('No category found, skipping related posts');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching related posts for category:', currentPost.category.slug);
        const posts = await fetchRelatedPostsByCategory(
          currentPost.category.slug,
          currentPost.id,
          3 // Get 3 related posts
        );
        console.log('Related posts fetched:', posts);
        setRelatedPosts(posts);
      } catch (error) {
        console.error('Error loading related posts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRelatedPosts();
  }, [currentPost.id, currentPost.category_id, currentPost.category?.slug]);

  // Don't show anything while loading
  if (loading) {
    return null;
  }

  // Don't show if no related posts
  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <div className="related-posts-section my-5">
      <div className="related-posts row">
        {relatedPosts.map((post) => {
          const processedTitle = transformContent(post.title || "");
          const imageUrl = post.thumbnail_url 
            ? `/images/${post.thumbnail_url}` 
            : '/images/default-thumbnail.jpg';

          return (
            <div key={post.id} className="col-md-4 mb-4">
              <div 
                className="home-post-related gb-container-724b7582" 
                style={{
                  backgroundImage: `url('${imageUrl}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  minHeight: '350px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '20px',
                  borderRadius: '8px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Overlay gradient */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)',
                  zIndex: 1
                }} />

                {/* Content */}
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <h2 
                    className="home-post-title related-post" 
                    style={{
                      color: '#fff',
                      fontSize: '24px',
                      marginBottom: '15px',
                      fontWeight: 'bold',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                    }}
                    dangerouslySetInnerHTML={{ __html: processedTitle }}
                    suppressHydrationWarning
                  />
                  
                  <a 
                    href={`/${post.slug}`} 
                    className="gb-button gb-button-70507aac arrow-link"
                    style={{
                      color: '#fff',
                      textDecoration: 'none',
                      fontSize: '16px',
                      fontWeight: '600',
                      display: 'inline-block',
                      borderBottom: '2px solid #fff',
                      paddingBottom: '5px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderBottomWidth = '3px';
                      e.currentTarget.style.paddingBottom = '4px';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderBottomWidth = '2px';
                      e.currentTarget.style.paddingBottom = '5px';
                    }}
                  >
                    READ MORE
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}