import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/core/database/index';
import { ensureBlogPostSchema } from '@/lib/modules/blogs/ensureBlogPostSchema';

// ─── Validation ────────────────────────────────────────────────────────────

const emptyToNull = (v) => (typeof v === 'string' && v.trim() === '' ? null : v);

const idSchema = z.coerce.number().int().positive();

const WIDTH_VALUES = ['Étroit', 'Standard', 'Large'];

const blogFieldsSchema = z.object({
  title:           z.string().trim().min(1, 'Le titre est requis').max(255),
  slug:            z.string().trim().min(1, 'Le slug est requis').max(300),
  category:        z.string().trim().min(1, 'La catégorie est requise').max(100),
  excerpt:         z.preprocess(emptyToNull, z.string().nullable().optional()),
  metaDescription: z.preprocess(emptyToNull, z.string().nullable().optional()),
  author:          z.preprocess(emptyToNull, z.string().max(255).nullable().optional()),
  readTime:        z.preprocess(emptyToNull, z.string().max(20).nullable().optional()),
  thumbnail:       z.preprocess(emptyToNull, z.string().max(500).nullable().optional()),
  content:         z.array(z.any()).optional(),
  isPublished:     z.boolean().optional(),
  accentColor:     z.preprocess(emptyToNull, z.string().max(20).nullable().optional()),
  contentWidth:    z.enum(WIDTH_VALUES).optional(),
  spacing:         z.coerce.number().int().min(1).max(10).optional(),
});

const createSchema = blogFieldsSchema;
const updateSchema = blogFieldsSchema.partial().extend({ id: idSchema });

// ─── Helpers ───────────────────────────────────────────────────────────────

class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    throw new HttpError(403, 'Accès refusé');
  }
}

async function readJsonBody(request) {
  try {
    return await request.json();
  } catch {
    throw new HttpError(400, 'Corps de requête JSON invalide');
  }
}

function parseOrThrow(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new HttpError(400, 'Données invalides', result.error.flatten().fieldErrors);
  }
  return result.data;
}

function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Ajoute un suffixe numérique tant que le slug est pris par un autre article
async function getUniqueSlug(rawSlug, excludeId) {
  const base = slugify(rawSlug);
  if (!base) throw new HttpError(400, 'Le slug ne contient aucun caractère valide');

  let candidate = base;
  let suffix = 1;
  for (;;) {
    const existing = await prisma.blogPost.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${base}-${suffix++}`;
  }
}

/** Normalise SEO + design : metaDescription alimente aussi excerpt si absent. */
function normalizeSeoAndDesign(fields) {
  const metaDescription = fields.metaDescription ?? fields.excerpt ?? null;
  const excerpt = fields.excerpt ?? metaDescription;

  return {
    ...fields,
    metaDescription,
    excerpt,
    contentWidth: fields.contentWidth ?? 'Standard',
    spacing: fields.spacing ?? 5,
  };
}

async function createPost(body) {
  const parsed = parseOrThrow(createSchema, body);
  const { slug, author, content, isPublished, ...rest } = normalizeSeoAndDesign(parsed);

  return prisma.blogPost.create({
    data: {
      ...rest,
      slug: await getUniqueSlug(slug),
      author: author ?? "L'équipe Bibli'o",
      content: content ?? [],
      isPublished: isPublished ?? false,
    },
  });
}

async function updatePost(body) {
  const parsed = parseOrThrow(updateSchema, body);
  const { id, slug, ...rest } = parsed;

  const existing = await prisma.blogPost.findUnique({
    where: { id },
    select: { id: true },
  });

  // Id stale / article jamais persisté en prod → créer plutôt que renvoyer 404
  if (!existing) {
    const { id: _ignored, ...createBody } = body;
    return createPost(createBody);
  }

  // Sur update partiel : ne synchronise excerpt/meta que si l'un des deux est fourni
  const data = { ...rest };
  if (rest.metaDescription !== undefined && rest.excerpt === undefined) {
    data.excerpt = rest.metaDescription;
  }
  if (rest.excerpt !== undefined && rest.metaDescription === undefined) {
    data.metaDescription = rest.excerpt;
  }

  return prisma.blogPost.update({
    where: { id },
    data: {
      ...data,
      ...(slug !== undefined && { slug: await getUniqueSlug(slug, id) }),
    },
  });
}

function errorResponse(error, action) {
  if (error instanceof HttpError) {
    return NextResponse.json(
      { error: error.message, ...(error.details && { details: error.details }) },
      { status: error.status },
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Article introuvable' }, { status: 404 });
    }
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Un article avec ce slug existe déjà' }, { status: 409 });
    }
  }

  console.error(`[api/admin/blogs] ${action}:`, error);
  return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
}

// ─── Handlers ──────────────────────────────────────────────────────────────

export async function GET() {
  try {
    await requireAdmin();
    await ensureBlogPostSchema();
    const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(posts);
  } catch (error) {
    return errorResponse(error, 'GET');
  }
}

export async function POST(request) {
  try {
    await requireAdmin();
    await ensureBlogPostSchema();
    const body = await readJsonBody(request);

    if (body?.id != null) {
      return NextResponse.json(await updatePost(body));
    }
    return NextResponse.json(await createPost(body), { status: 201 });
  } catch (error) {
    return errorResponse(error, 'POST');
  }
}

export async function PUT(request) {
  try {
    await requireAdmin();
    await ensureBlogPostSchema();
    const body = await readJsonBody(request);
    return NextResponse.json(await updatePost(body));
  } catch (error) {
    return errorResponse(error, 'PUT');
  }
}

export async function DELETE(request) {
  try {
    await requireAdmin();
    await ensureBlogPostSchema();
    const body = await readJsonBody(request);
    const id = parseOrThrow(idSchema, body?.id);

    await prisma.blogPost.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error, 'DELETE');
  }
}
