/*
  Warnings:

  - A unique constraint covering the columns `[productid,sizecolorid]` on the table `Images` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Images_productid_sizecolorid_key" ON "Images"("productid", "sizecolorid");
