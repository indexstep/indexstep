'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  imageUrl: string | null;
  authorName: string;
  publishedAt: string | null;
  createdAt: string;
  viewCount: number;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/blog')
      .then(res => res.json())
      .then(data => {
        setPosts(data.posts || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (posts.length === 0) {
      const script = document.createElement('script');
      script.src = 'https://app.trysoro.com/api/embed/38858c3d-3909-4aeb-948b-963a985c5e81';
      script.defer = true;
      document.getElementById('soro-blog')?.appendChild(script);
    }
  }, [posts]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatViews = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--bg)', color: 'var(--text)', fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      {/* Win11 Toolbar */}
      <div className="win-toolbar px-6 py-3 flex items-center gap-3">
        <span className="text-base font-semibold" style={{ color: 'var(--text)' }}>Computer</span>
        <span className="text-gray-400">›</span>
        <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Blog</span>
      </div>

      {/* Force white bg on soro widget content */}
      <style>{`
        #soro-blog, #soro-blog * {
          background-color: #ffffff !important;
          color: #111111 !important;
          border-color: #e5e5e5 !important;
        }
        #soro-blog a { color: #0066cc !important; }
      `}</style>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>
            Blog
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Guides, tips, and step-by-step tutorials from the stephud team.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div
              className="animate-spin rounded-full h-8 w-8 border-b-2"
              style={{ borderColor: '#ff9940' }}
            ></div>
          </div>
        ) : posts.length === 0 ? (
          <div id="soro-blog"></div>
        ) : (
          <div className="grid gap-6">
            {posts.map(post => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="block win-panel overflow-hidden transition-all card-hover"
              >
                {post.imageUrl && (
                  <div className="relative h-48 w-full">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="object-cover w-full h-full"
                      style={{ backgroundColor: 'var(--bg-tertiary)' }}
                    />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                    <span>{post.authorName}</span>
                    <span>·</span>
                    <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                    <span>·</span>
                    <span>👁 {formatViews(post.viewCount)} views</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
