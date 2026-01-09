/**
 * VÍ DỤ CÁCH GỌI API TRONG NEXT.JS
 * 
 * File này chứa các ví dụ về cách sử dụng API client trong các page/components
 */

import { api } from './api-client';
import { API_ENDPOINTS, getPostBySlugEndpoint } from '@/src/constants/api-endpoints';

// ============================================
// VÍ DỤ 1: Client Component (sử dụng useEffect)
// ============================================
/*
"use client";
import { useEffect, useState } from 'react';

export default function MyPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await api.get('/api/posts/my-slug');
        setData(response);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return <div>{JSON.stringify(data)}</div>;
}
*/

// ============================================
// VÍ DỤ 2: Server Component (Next.js 13+ App Router)
// ============================================
/*
import { api } from '@/src/lib/api-client';
import { getPostBySlugEndpoint } from '@/src/constants/api-endpoints';

export default async function MyServerPage({ params }: { params: { slug: string } }) {
  try {
    // Gọi API trực tiếp trong Server Component
    const post = await api.get(getPostBySlugEndpoint(params.slug));
    return <div>{post.title}</div>;
  } catch (error) {
    return <div>Error loading post</div>;
  }
}
*/

// ============================================
// VÍ DỤ 3: Sử dụng custom hook
// ============================================
/*
"use client";
import { useState, useEffect } from 'react';
import { fetchPostBySlug } from '@/src/lib/posts-api';

export function usePost(slug: string) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchPostBySlug(slug);
        setPost(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  return { post, loading, error };
}

// Sử dụng trong component:
export default function MyComponent({ slug }: { slug: string }) {
  const { post, loading, error } = usePost(slug);
  // ...
}
*/

// ============================================
// VÍ DỤ 4: POST request (tạo dữ liệu mới)
// ============================================
/*
export async function createPost(postData: any) {
  try {
    const response = await api.post(API_ENDPOINTS.POSTS, postData);
    return response;
  } catch (error: any) {
    console.error('Error creating post:', error);
    throw error;
  }
}

// Sử dụng:
const handleSubmit = async (formData: any) => {
  try {
    const newPost = await createPost(formData);
    console.log('Post created:', newPost);
  } catch (error) {
    console.error('Failed to create post');
  }
};
*/

// ============================================
// VÍ DỤ 5: PUT request (cập nhật)
// ============================================
/*
export async function updatePost(slug: string, postData: any) {
  try {
    const response = await api.put(getPostBySlugEndpoint(slug), postData);
    return response;
  } catch (error: any) {
    console.error('Error updating post:', error);
    throw error;
  }
}
*/

// ============================================
// VÍ DỤ 6: DELETE request (xóa)
// ============================================
/*
export async function deletePost(slug: string) {
  try {
    await api.delete(getPostBySlugEndpoint(slug));
  } catch (error: any) {
    console.error('Error deleting post:', error);
    throw error;
  }
}
*/

// ============================================
// VÍ DỤ 7: Xử lý lỗi chi tiết
// ============================================
/*
try {
  const data = await api.get('/api/posts/slug');
} catch (error: any) {
  if (error.status === 404) {
    // Xử lý không tìm thấy
    console.log('Post not found');
  } else if (error.status === 401) {
    // Xử lý chưa đăng nhập
    console.log('Unauthorized');
  } else if (error.status === 500) {
    // Xử lý lỗi server
    console.log('Server error');
  } else {
    // Lỗi khác
    console.log('Error:', error.message);
  }
}
*/

