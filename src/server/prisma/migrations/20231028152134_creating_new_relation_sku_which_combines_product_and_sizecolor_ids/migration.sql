/*
  Warnings:

  - You are about to drop the column `productid` on the `Images` table. All the data in the column will be lost.
  - You are about to drop the column `sizecolorid` on the `Images` table. All the data in the column will be lost.
  - You are about to drop the column `productid` on the `Stock` table. All the data in the column will be lost.
  - You are about to drop the column `sizecolorid` on the `Stock` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Images" DROP CONSTRAINT "Images_productid_fkey";

-- DropForeignKey
ALTER TABLE "Images" DROP CONSTRAINT "Images_sizecolorid_fkey";

-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_productid_fkey";

-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_sizecolorid_fkey";

-- DropIndex
DROP INDEX "Images_productid_sizecolorid_key";

-- AlterTable
ALTER TABLE "Images" DROP COLUMN "productid",
DROP COLUMN "sizecolorid",
ADD COLUMN     "skuid" TEXT;

-- AlterTable
ALTER TABLE "Stock" DROP COLUMN "productid",
DROP COLUMN "sizecolorid",
ADD COLUMN     "skuid" TEXT;

-- CreateTable
CREATE TABLE "SKU" (
    "id" TEXT NOT NULL,
    "productid" TEXT NOT NULL,
    "sizecolorid" TEXT NOT NULL,

    CONSTRAINT "SKU_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SKU_productid_sizecolorid_key" ON "SKU"("productid", "sizecolorid");

-- AddForeignKey
ALTER TABLE "SKU" ADD CONSTRAINT "SKU_productid_fkey" FOREIGN KEY ("productid") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SKU" ADD CONSTRAINT "SKU_sizecolorid_fkey" FOREIGN KEY ("sizecolorid") REFERENCES "SizeColor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Images" ADD CONSTRAINT "Images_skuid_fkey" FOREIGN KEY ("skuid") REFERENCES "SKU"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_skuid_fkey" FOREIGN KEY ("skuid") REFERENCES "SKU"("id") ON DELETE SET NULL ON UPDATE CASCADE;
