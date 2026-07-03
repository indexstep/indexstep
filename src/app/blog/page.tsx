'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  imageUrl: string | null;
  authorName: string;
  publishedAt: string | null;
  createdAt: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/blog')
      .then((r) => r.json())
      .then((data) => {
        setPosts(data.posts || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Blog</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Guides, tips, and step-by-step tutorials from the stephud team.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent)', animation: 'dot-bounce 1s infinite 0ms' }} />
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent)', animation: 'dot-bounce 1s infinite 150ms' }} />
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent)', animation: 'dot-bounce 1s infinite 300ms' }} />
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p style={{ color: 'var(--text-secondary)' }}>No posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="block rounded-xl overflow-hidden transition-all hover:scale-[1.01]"
                style={{
                  backgroundColor: 'var(--bg-highlight)',
                  border: '1px solid var(--border)',
                }}
              >
                {post.imageUrl && (
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <span>{post.authorName}</span>
                    <span>·</span>
                    <span>
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : new Date(post.createdAt).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                    </span>
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
