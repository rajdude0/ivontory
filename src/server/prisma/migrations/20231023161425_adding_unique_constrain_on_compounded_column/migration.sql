/*
  Warnings:

  - A unique constraint covering the columns `[colorid,sizegenerid]` on the table `SizeColor` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sizeid,genderid]` on the table `SizeGender` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SizeColor_colorid_sizegenerid_key" ON "SizeColor"("colorid", "sizegenerid");

-- CreateIndex
CREATE UNIQUE INDEX "SizeGender_sizeid_genderid_key" ON "SizeGender"("sizeid", "genderid");
