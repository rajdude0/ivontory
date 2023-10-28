/*
  Warnings:

  - Added the required column `colorid` to the `SizeColor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SizeColor" ADD COLUMN     "colorid" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "SizeColor" ADD CONSTRAINT "SizeColor_colorid_fkey" FOREIGN KEY ("colorid") REFERENCES "Color"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
