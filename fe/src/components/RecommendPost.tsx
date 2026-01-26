import React from 'react';
import Link from 'next/link';
import { PostApiResponse } from '@/types/api';
import { fetchRecommendedPost } from '@/lib/posts-api';
import { transformContent } from "@/lib/content-utils";

interface RecommendedPostProps {
  postId: number;
}

export default async function RecommendedPost({ postId }: RecommendedPostProps) {
  const recommendedPost = await fetchRecommendedPost(postId);

  if (!recommendedPost) {
    return null;
  }

  const processedTitle = transformContent(recommendedPost.title || "");
  const processedExcerpt = transformContent(recommendedPost.excerpt || "");

  return (
    <div 
      className="d-sm-block py-3 mx-auto px-3 my-5" 
      style={{ 
        borderTop: '1px solid rgb(204, 204, 204)', 
        borderBottom: '1px solid rgb(204, 204, 204)' 
      }}
    >
      {/* Headline centralizado */}
      <div className="text-center mb-4">
        <h6 className="pt-3 text-center text-gray-900 text-2xl title-font font-medium mb-12">
          Recommended Content
        </h6>
      </div>
      
      <div className="row">
        <div className="col-lg-5 col-md-5 col-sm-12 mb-4 mb-lg-0">
          {recommendedPost.thumbnail_url && (
            <div className="post-thumbnail p-3">
              <a href={`/${recommendedPost.slug}`}>
                <img
                  alt={recommendedPost.title || 'Recommended post'}
                  className="w-100"
                  style={{
                    width: "233px",
                    objectFit: "cover",
                    borderRadius: "0px",
                    height: '190px'
                  }}
                  src={`/images/${recommendedPost.thumbnail_url}`}
                  loading="lazy"
                />
              </a>
            </div>
          )}
        </div>
        
        <div className="col-lg-7 col-md-7 col-sm-12 d-flex flex-column justify-content-between">
          <div>
            <h3 
              className="text-gray-900 text-3xl title-font font-medium mb-1"
              dangerouslySetInnerHTML={{ __html: processedTitle }}
            />
            <div 
              className="d-block text-justify py-3"
              dangerouslySetInnerHTML={{ __html: processedExcerpt }}
            />
          </div>
          
          <div className="mt-auto d-flex flex-column align-items-end">
            <Link 
              className="d-inline-block text-center text-white border-0 py-2 px-8 text-lg focus:outline-none rounded bg-green-700 hover:bg-green-800 btn-block" 
              href={`/${recommendedPost.slug}`}
              data-analytics-label="recommendedPostButton" 
              data-action="analytics#trackCTA"
            >
              See more jobs
            </Link>
            <div className="text-xs text-muted mt-3 d-block col-12 text-center">
              You will remain in the same website
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}