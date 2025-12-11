/*
  Warnings:

  - The `status` column on the `Orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PREPARING', 'SHIPPED', 'ACTIVE', 'RETURNING', 'RETURNED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ProductCondition" AS ENUM ('NEW', 'GOOD', 'FAIR', 'REPAIRING', 'RETIRED');

-- AlterTable
ALTER TABLE "Orders" ADD COLUMN     "trackingNumber" VARCHAR(100),
DROP COLUMN "status",
ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Products" ADD COLUMN     "ageRange" VARCHAR(50),
ADD COLUMN     "brand" VARCHAR(100),
ADD COLUMN     "condition" "ProductCondition" NOT NULL DEFAULT 'NEW',
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;
