-- AlterTable
ALTER TABLE "Orders" ADD COLUMN     "mondialRelayPointId" VARCHAR(20),
ADD COLUMN     "rentalEndDate" TIMESTAMPTZ(6),
ADD COLUMN     "rentalStartDate" TIMESTAMPTZ(6),
ADD COLUMN     "returnTrackingNumber" VARCHAR(100),
ADD COLUMN     "trackingUrl" TEXT;

-- AlterTable
ALTER TABLE "Products" ADD COLUMN     "highlights" TEXT[];
