import { NextResponse } from 'next/server';
import prisma from '@/lib/core/database/index';
import { ensureBlogPostSchema } from '@/lib/modules/blogs/ensureBlogPostSchema';

export async function GET(request, { params }) {
  const { slug } = await params;

  await ensureBlogPostSchema();
  const post = await prisma.blogPost.findUnique({
    where: { slug },
  });

  if (!post || !post.isPublished) {
    return NextResponse.json({ error: 'Article introuvable' }, { status: 404 });
  }

  return NextResponse.json(post);
}
