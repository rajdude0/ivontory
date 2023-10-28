-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_tagid_fkey";

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "tagid" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_tagid_fkey" FOREIGN KEY ("tagid") REFERENCES "Tags"("id") ON DELETE SET NULL ON UPDATE CASCADE;
