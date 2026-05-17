/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Products` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeCustomerId]` on the table `Users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "OrderType" ADD VALUE 'REFILL';

-- AlterTable
ALTER TABLE "Orders" ADD COLUMN     "outboundLabelUrl" TEXT;

-- AlterTable
ALTER TABLE "Products" ADD COLUMN     "biblioPrice" DOUBLE PRECISION,
ADD COLUMN     "brandSlug" VARCHAR(150),
ADD COLUMN     "slug" VARCHAR(300);

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "stripeCustomerId" VARCHAR(255);

-- CreateTable
CREATE TABLE "StripeInvoice" (
    "id" TEXT NOT NULL,
    "stripeInvoiceId" VARCHAR(255) NOT NULL,
    "stripeSubId" VARCHAR(255) NOT NULL,
    "userId" INTEGER NOT NULL,
    "amountPaid" INTEGER NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'eur',
    "status" VARCHAR(50) NOT NULL,
    "invoiceNumber" VARCHAR(100),
    "hostedInvoiceUrl" TEXT,
    "invoicePdf" TEXT,
    "periodStart" TIMESTAMPTZ(6),
    "periodEnd" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StripeInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GiftCode" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "usedBy" INTEGER,
    "usedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GiftCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StripeInvoice_stripeInvoiceId_key" ON "StripeInvoice"("stripeInvoiceId");

-- CreateIndex
CREATE INDEX "StripeInvoice_userId_idx" ON "StripeInvoice"("userId");

-- CreateIndex
CREATE INDEX "StripeInvoice_stripeSubId_idx" ON "StripeInvoice"("stripeSubId");

-- CreateIndex
CREATE UNIQUE INDEX "GiftCode_code_key" ON "GiftCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Products_slug_key" ON "Products"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Users_stripeCustomerId_key" ON "Users"("stripeCustomerId");

-- AddForeignKey
ALTER TABLE "StripeInvoice" ADD CONSTRAINT "StripeInvoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftCode" ADD CONSTRAINT "GiftCode_usedBy_fkey" FOREIGN KEY ("usedBy") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
