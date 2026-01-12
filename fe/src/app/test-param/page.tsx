// src/app/test-params/page.tsx
// Test xem generateStaticParams có chạy đúng không

import { fetchAllPosts } from "@/lib/posts-api";

export default async function TestParamsPage() {
  let posts = null;
  let error = null;
  let params = null;

  try {
    // Giống hệt logic trong generateStaticParams
    posts = await fetchAllPosts();
    console.log('Posts fetched:', posts?.length || 0);
    
    if (!posts || !Array.isArray(posts)) {
      console.warn('No posts found or invalid response');
      params = [];
    } else {
      params = posts
        .filter((post) => post && post.slug)
        .map((post) => ({
          slug: post.slug,
        }));
    }
  } catch (e: any) {
    error = e.message;
    console.error('Error:', e);
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>generateStaticParams Debug</h1>
      
      {error && (
        <div style={{ background: '#ffebee', padding: '10px', marginBottom: '20px', color: 'red' }}>
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      <div style={{ background: '#e3f2fd', padding: '10px', marginBottom: '20px' }}>
        <strong>Total posts fetched:</strong> {posts?.length || 0}
      </div>

      <h2>Generated Params (slugs):</h2>
      <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
        {JSON.stringify(params, null, 2)}
      </pre>

      <h2>Raw Posts Data:</h2>
      <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', maxHeight: '400px' }}>
        {JSON.stringify(posts, null, 2)}
      </pre>

      <h2>Check if coca-cola-jobs exists:</h2>
      <div style={{ background: posts?.some((p: any) => p.slug === 'coca-cola-jobs') ? '#c8e6c9' : '#ffcdd2', padding: '10px' }}>
        {posts?.some((p: any) => p.slug === 'coca-cola-jobs') 
          ? '✅ Found coca-cola-jobs in posts!' 
          : '❌ coca-cola-jobs NOT found in posts'}
      </div>

      <h2>Test Links:</h2>
      <ul>
        {params?.map((param: any) => (
          <li key={param.slug}>
            <a href={`/${param.slug}`} style={{ color: 'blue', textDecoration: 'underline' }}>
              /{param.slug}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}