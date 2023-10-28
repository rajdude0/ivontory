/*
  Warnings:

  - You are about to drop the column `skuid` on the `Images` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Images" DROP CONSTRAINT "Images_skuid_fkey";

-- DropForeignKey
ALTER TABLE "SKU" DROP CONSTRAINT "SKU_productid_fkey";

-- DropForeignKey
ALTER TABLE "SKU" DROP CONSTRAINT "SKU_sizecolorid_fkey";

-- AlterTable
ALTER TABLE "Images" DROP COLUMN "skuid";

-- AlterTable
ALTER TABLE "SKU" ADD COLUMN     "imageid" TEXT,
ALTER COLUMN "productid" DROP NOT NULL,
ALTER COLUMN "sizecolorid" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "SKU" ADD CONSTRAINT "SKU_productid_fkey" FOREIGN KEY ("productid") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SKU" ADD CONSTRAINT "SKU_sizecolorid_fkey" FOREIGN KEY ("sizecolorid") REFERENCES "SizeColor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SKU" ADD CONSTRAINT "SKU_imageid_fkey" FOREIGN KEY ("imageid") REFERENCES "Images"("id") ON DELETE SET NULL ON UPDATE CASCADE;
