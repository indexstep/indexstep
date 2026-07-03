import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/blog/[slug]/view - Increment view count
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const post = await prisma.blogPost.update({
    where: { slug },
    data: { viewCount: { increment: 1 } },
  });

  return NextResponse.json({ viewCount: post.viewCount });
}
