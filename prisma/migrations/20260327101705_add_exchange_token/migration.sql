-- AlterTable
ALTER TABLE "Orders" ADD COLUMN     "hasExchangedThisMonth" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Products" ADD COLUMN     "material" VARCHAR(100);

-- AlterTable
ALTER TABLE "Reviews" ADD COLUMN     "authorName" VARCHAR(255) DEFAULT 'Abonné(e)',
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "PromoCodeUsage" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "promoCode" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromoCodeUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PromoCodeUsage_userId_promoCode_key" ON "PromoCodeUsage"("userId", "promoCode");

-- AddForeignKey
ALTER TABLE "PromoCodeUsage" ADD CONSTRAINT "PromoCodeUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
