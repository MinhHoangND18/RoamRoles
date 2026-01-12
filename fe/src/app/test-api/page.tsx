export default async function TestApiPage() {
  let error = null;
  let posts = null;
  let specificPost = null;

  try {
    // Test 1: Fetch all posts
    const allPostsResponse = await fetch('http://localhost:8088/api');
    posts = await allPostsResponse.json();
    console.log('All posts:', posts);

    // Test 2: Fetch specific post
    const specificResponse = await fetch('http://localhost:8088/api/coca-cola-jobs');
    specificPost = await specificResponse.json();
    console.log('Specific post:', specificPost);

  } catch (e: any) {
    error = e.message;
    console.error('API Error:', e);
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>API Test Results</h1>
      
      {error && (
        <div style={{ background: '#ffebee', padding: '10px', marginBottom: '20px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <h2>All Posts Response:</h2>
      <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
        {JSON.stringify(posts, null, 2)}
      </pre>

      <h2>Coca-Cola Jobs Post:</h2>
      <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
        {JSON.stringify(specificPost, null, 2)}
      </pre>

      <h2>Test URLs:</h2>
      <ul>
        <li>
          <a href="http://localhost:8088/api" target="_blank">
            Direct API: /api
          </a>
        </li>
        <li>
          <a href="http://localhost:8088/api/coca-cola-jobs" target="_blank">
            Direct API: /api/coca-cola-jobs
          </a>
        </li>
        <li>
          <a href="/coca-cola-jobs">
            Next.js route: /coca-cola-jobs
          </a>
        </li>
      </ul>
    </div>
  );
}