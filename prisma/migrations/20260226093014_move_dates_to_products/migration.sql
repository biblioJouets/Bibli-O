/*
  Warnings:

  - You are about to drop the column `nextBillingDate` on the `Orders` table. All the data in the column will be lost.
  - You are about to drop the column `renewalIntention` on the `Orders` table. All the data in the column will be lost.
  - You are about to drop the column `rentalEndDate` on the `Orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OrderProducts" ADD COLUMN     "nextBillingDate" TIMESTAMPTZ(6),
ADD COLUMN     "renewalIntention" VARCHAR(50),
ADD COLUMN     "rentalEndDate" TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "Orders" DROP COLUMN "nextBillingDate",
DROP COLUMN "renewalIntention",
DROP COLUMN "rentalEndDate";
