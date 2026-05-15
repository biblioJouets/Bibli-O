import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/core/database/index';

function adminOnly(session) {
  return session?.user?.role === 'ADMIN';
}

// GET — liste tous les articles (admin)
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!adminOnly(session)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(posts);
}

// POST — créer un article
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!adminOnly(session)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const body = await request.json();
  const { title, slug, category, excerpt, author, readTime, thumbnail, content, isPublished } = body;

  if (!title || !slug || !category) {
    return NextResponse.json({ error: 'title, slug et category sont requis' }, { status: 400 });
  }

  // Garantit l'unicité du slug en ajoutant un suffixe numérique si nécessaire
  let uniqueSlug = slug;
  let suffix = 1;
  while (await prisma.blogPost.findUnique({ where: { slug: uniqueSlug } })) {
    uniqueSlug = `${slug}-${suffix++}`;
  }

  const post = await prisma.blogPost.create({
    data: {
      title,
      slug: uniqueSlug,
      category,
      excerpt: excerpt ?? null,
      author: author ?? "L'équipe Bibli'o",
      readTime: readTime ?? null,
      thumbnail: thumbnail ?? null,
      content: content ?? [],
      isPublished: isPublished ?? false,
    },
  });

  return NextResponse.json(post, { status: 201 });
}

// PUT — mettre à jour un article
export async function PUT(request) {
  const session = await getServerSession(authOptions);
  if (!adminOnly(session)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const body = await request.json();
  const { id, title, slug, category, excerpt, author, readTime, thumbnail, content, isPublished } = body;

  if (!id) {
    return NextResponse.json({ error: 'id requis' }, { status: 400 });
  }

  const post = await prisma.blogPost.update({
    where: { id: Number(id) },
    data: {
      ...(title !== undefined && { title }),
      ...(slug !== undefined && { slug }),
      ...(category !== undefined && { category }),
      ...(excerpt !== undefined && { excerpt }),
      ...(author !== undefined && { author }),
      ...(readTime !== undefined && { readTime }),
      ...(thumbnail !== undefined && { thumbnail }),
      ...(content !== undefined && { content }),
      ...(isPublished !== undefined && { isPublished }),
    },
  });

  return NextResponse.json(post);
}

// DELETE — supprimer un article
export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!adminOnly(session)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const body = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: 'id requis' }, { status: 400 });
  }

  await prisma.blogPost.delete({ where: { id: Number(id) } });

  return NextResponse.json({ ok: true });
}
