/*
  Warnings:

  - You are about to drop the column `name` on the `Users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "Orders" ADD COLUMN     "shippingAddress" VARCHAR(255),
ADD COLUMN     "shippingCity" VARCHAR(100),
ADD COLUMN     "shippingName" VARCHAR(255),
ADD COLUMN     "shippingZip" VARCHAR(20),
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Users" DROP COLUMN "name",
ADD COLUMN     "firstName" VARCHAR(255),
ADD COLUMN     "lastName" VARCHAR(255),
ADD COLUMN     "phone" VARCHAR(20),
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER',
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Address" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100),
    "street" VARCHAR(255) NOT NULL,
    "zipCode" VARCHAR(20) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "country" VARCHAR(100) NOT NULL DEFAULT 'France',
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
