-- AlterTable: add childAge and childGender to Orders for Box Mystère feature
ALTER TABLE "Orders" ADD COLUMN "childAge" VARCHAR(20),
                     ADD COLUMN "childGender" VARCHAR(20);
