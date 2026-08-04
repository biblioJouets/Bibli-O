/*
  Warnings:

  - A unique constraint covering the columns `[cartId,productId,intent]` on the table `CartItem` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "CartItem_cartId_productId_key";

-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "intent" VARCHAR(20) NOT NULL DEFAULT 'RENTAL';

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_productId_intent_key" ON "CartItem"("cartId", "productId", "intent");
