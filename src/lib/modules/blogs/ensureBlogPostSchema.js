import prisma from '@/lib/core/database/index';

// Le déploiement ne lance pas `prisma migrate`. Ces requêtes rattrapent
// la migration 20261006100000_blog_post_design_fields sur une base déjà créée.
const BLOG_POST_SCHEMA_SQL = [
  `CREATE TABLE IF NOT EXISTS "BlogPost" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(300) NOT NULL,
    "thumbnail" VARCHAR(500),
    "category" VARCHAR(100) NOT NULL,
    "excerpt" TEXT,
    "metaDescription" TEXT,
    "author" VARCHAR(255) NOT NULL DEFAULT 'L''équipe Bibli''o',
    "readTime" VARCHAR(20),
    "content" JSONB NOT NULL DEFAULT '[]',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "accentColor" VARCHAR(20),
    "contentWidth" VARCHAR(20) DEFAULT 'Standard',
    "spacing" INTEGER DEFAULT 5,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "BlogPost_slug_key" ON "BlogPost"("slug")`,
  `ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "metaDescription" TEXT`,
  `ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "accentColor" VARCHAR(20)`,
  `ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "contentWidth" VARCHAR(20) DEFAULT 'Standard'`,
  `ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "spacing" INTEGER DEFAULT 5`,
];

let pending = null;

export function ensureBlogPostSchema() {
  if (!pending) {
    pending = (async () => {
      for (const sql of BLOG_POST_SCHEMA_SQL) {
        await prisma.$executeRawUnsafe(sql);
      }
    })().catch((error) => {
      pending = null;
      throw error;
    });
  }
  return pending;
}
