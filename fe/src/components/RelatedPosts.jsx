import React from 'react';

const RelatedPosts = ({ relatedPosts, currentPost, transformContent }) => {
  // Kiểm tra dữ liệu đầu vào
  if (!relatedPosts || relatedPosts.length === 0) {
    return null;
  }

  // Lọc bỏ bài viết hiện tại và lấy 3 bài đầu tiên
  const displayPosts = relatedPosts
    .filter((p) => p.id !== currentPost?.id)
    .slice(0, 3);

  if (displayPosts.length === 0) {
    return null;
  }

  // Hàm fallback nếu transformContent không được truyền vào
  const safeTransform = transformContent || ((content) => content);

  return (
    <div className="related-posts row mt-5">
      {displayPosts.map((rPost) => (
        <div className="col-md-4 mb-4" key={rPost.id}>
          <div
            className="home-post-related gb-container-724b7582"
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.4),rgba(0,0,0,0.4)), url(/images/${rPost.thumbnail_url})`,
              backgroundSize: 'cover',
              height: '280px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '20px',
              borderRadius: '8px',
            }}
          >
            <h2
              style={{ color: '#fff', fontSize: '18px' }}
              dangerouslySetInnerHTML={{ __html: safeTransform(rPost.title) }}
            />
            <a href={`/${rPost.slug}`} className="btn btn-sm btn-light" style={{ width: 'fit-content' }}>
              Read More
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RelatedPosts;
