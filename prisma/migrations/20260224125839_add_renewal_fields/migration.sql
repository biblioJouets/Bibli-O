/*
  Warnings:

  - A unique constraint covering the columns `[resetToken]` on the table `Users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "OrderProducts" ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Orders" ADD COLUMN     "nextBillingDate" TIMESTAMPTZ(6),
ADD COLUMN     "renewalIntention" VARCHAR(50),
ADD COLUMN     "shippingPhone" VARCHAR(20),
ADD COLUMN     "stripeSubscriptionId" VARCHAR(255);

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "resetToken" VARCHAR(255),
ADD COLUMN     "resetTokenExpiry" TIMESTAMPTZ(6);

-- CreateIndex
CREATE UNIQUE INDEX "Users_resetToken_key" ON "Users"("resetToken");
