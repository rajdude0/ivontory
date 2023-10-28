/*
  Warnings:

  - A unique constraint covering the columns `[skuid]` on the table `Stock` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Stock_skuid_key" ON "Stock"("skuid");
