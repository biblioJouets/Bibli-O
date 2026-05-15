import { NextResponse } from 'next/server';
import prisma from '@/lib/core/database/index';

export async function GET() {
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      thumbnail: true,
      category: true,
      excerpt: true,
      author: true,
      readTime: true,
      createdAt: true,
    },
  });

  return NextResponse.json(posts);
}
