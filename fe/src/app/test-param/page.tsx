import { fetchAllPosts } from "@/lib/posts-api";

export default async function TestParamsPage() {
  let posts = null;
  let error = null;

  try {
    posts = await fetchAllPosts();
    console.log('Posts fetched:', posts?.length || 0);
  } catch (e: any) {
    error = e.message;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Debug Test</h1>
      
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      
      <p><strong>Total posts:</strong> {posts?.length || 0}</p>
      
      <h2>Posts:</h2>
      <pre style={{ background: '#f5f5f5', padding: '10px' }}>
        {JSON.stringify(posts, null, 2)}
      </pre>
      
      <h2>Has coca-cola-jobs?</h2>
      <p style={{ fontSize: '24px' }}>
        {posts?.some((p: any) => p.slug === 'coca-cola-jobs') ? '✅ YES' : '❌ NO'}
      </p>

      <h2>Test link:</h2>
      <a href="/coca-cola-jobs" style={{ color: 'blue' }}>/coca-cola-jobs</a>
    </div>
  );
}