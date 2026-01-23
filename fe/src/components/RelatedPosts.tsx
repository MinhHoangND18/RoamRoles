'use client';

import React, { useEffect, useState } from 'react';
import { PostApiResponse } from '@/types/api';
import { transformContent } from "@/lib/content-utils";
import { fetchRelatedPostsByPostId } from '@/lib/related-posts-api';

interface RelatedPostsProps {
  currentPost: PostApiResponse;
}

export default function RelatedPosts({ currentPost }: RelatedPostsProps) {
  const [relatedPosts, setRelatedPosts] = useState<PostApiResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRelatedPosts = async () => {
      if (!currentPost.category_id) {
        console.log('No category found, skipping related posts');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching related posts for post ID:', currentPost.id);

        const posts = await fetchRelatedPostsByPostId(currentPost.id, 3);

        console.log('Related posts fetched:', posts);
        setRelatedPosts(posts);
      } catch (error) {
        console.error('Error loading related posts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRelatedPosts();
  }, [currentPost.id, currentPost.category_id]);
  if (loading) {
    return (
      <div className="related-posts-section my-5">
        <h3 className="mb-4" style={{ color: '#482d70' }}>Related Posts</h3>
        <div className="related-posts row">
          {[1, 2, 3].map((i) => (
            <div key={i} className="col-md-4 mb-4">
              <div
                style={{
                  minHeight: '350px',
                  borderRadius: '8px',
                  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'loading 1.5s ease-in-out infinite'
                }}
              />
            </div>
          ))}
        </div>
        <style jsx>{`
          @keyframes loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    );
  }

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
                  justifyContent: 'center',
                  alignItems: 'center',   
                  padding: '20px',
                  borderRadius: '10px',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.4)',
                  zIndex: 1
                }} />

                {/* Content Container */}
                <div style={{
                  position: 'relative',
                  zIndex: 2,
                  width: '100%',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <h2
                    className="home-post-title related-post"
                    style={{
                      color: '#fff',
                      fontSize: '20px',
                      marginBottom: '20px',
                      fontWeight: 'bold',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                      lineHeight: '1.4',
                      // LOGIC GIỚI HẠN 3 DÒNG:
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      maxWidth: '90%'
                    }}
                    dangerouslySetInnerHTML={{ __html: processedTitle }}
                    suppressHydrationWarning
                  />

                  <a
                    href={`/${post.slug}`}
                    className="gb-button arrow-link"
                    style={{
                      color: '#fff',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '700',
                      display: 'inline-block',
                      borderBottom: '2px solid #fff',
                      paddingBottom: '5px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}
                  >
                    Read More
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