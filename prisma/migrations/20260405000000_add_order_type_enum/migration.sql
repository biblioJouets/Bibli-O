-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('RENTAL', 'EXCHANGE', 'ADOPTION');

-- AlterTable
ALTER TABLE "Orders" ADD COLUMN "orderType" "OrderType" NOT NULL DEFAULT 'RENTAL';
