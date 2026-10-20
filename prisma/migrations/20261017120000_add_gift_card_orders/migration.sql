-- AlterEnum
ALTER TYPE "OrderType" ADD VALUE 'GIFT_CARD';

-- AlterTable
ALTER TABLE "CartItem" ALTER COLUMN "productId" DROP NOT NULL;
ALTER TABLE "CartItem" ADD COLUMN "customAmount" INTEGER;
ALTER TABLE "CartItem" ADD COLUMN "giftMetadata" JSONB;

-- AlterTable
ALTER TABLE "Orders" ADD COLUMN "giftDeliveryMethod" VARCHAR(20);
ALTER TABLE "Orders" ADD COLUMN "giftMetadata" JSONB;

-- AlterTable
ALTER TABLE "GiftCode" ADD COLUMN "orderId" INTEGER;
ALTER TABLE "GiftCode" ADD COLUMN "purchasedById" INTEGER;
ALTER TABLE "GiftCode" ADD COLUMN "recipientName" VARCHAR(255);
ALTER TABLE "GiftCode" ADD COLUMN "recipientEmail" VARCHAR(255);
ALTER TABLE "GiftCode" ADD COLUMN "message" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "GiftCode_orderId_key" ON "GiftCode"("orderId");

-- AddForeignKey
ALTER TABLE "GiftCode" ADD CONSTRAINT "GiftCode_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftCode" ADD CONSTRAINT "GiftCode_purchasedById_fkey" FOREIGN KEY ("purchasedById") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
