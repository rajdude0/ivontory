-- CreateTable
CREATE TABLE "Size" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "short" TEXT,
    "size" TEXT,
    "unit" TEXT,

    CONSTRAINT "Size_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SizeGender" (
    "id" TEXT NOT NULL,
    "sizeid" TEXT NOT NULL,
    "genderid" TEXT NOT NULL,

    CONSTRAINT "SizeGender_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Color" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "code" TEXT,

    CONSTRAINT "Color_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SizeColor" (
    "id" TEXT NOT NULL,
    "sizegenerid" TEXT NOT NULL,

    CONSTRAINT "SizeColor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Images" (
    "id" TEXT NOT NULL,
    "path" TEXT[],
    "productid" TEXT NOT NULL,
    "sizecolorid" TEXT NOT NULL,

    CONSTRAINT "Images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stock" (
    "id" TEXT NOT NULL,
    "productid" TEXT NOT NULL,
    "sizecolorid" TEXT NOT NULL,
    "count" DECIMAL(65,30) NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SizeGender" ADD CONSTRAINT "SizeGender_sizeid_fkey" FOREIGN KEY ("sizeid") REFERENCES "Size"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SizeGender" ADD CONSTRAINT "SizeGender_genderid_fkey" FOREIGN KEY ("genderid") REFERENCES "Gender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SizeColor" ADD CONSTRAINT "SizeColor_sizegenerid_fkey" FOREIGN KEY ("sizegenerid") REFERENCES "SizeGender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Images" ADD CONSTRAINT "Images_productid_fkey" FOREIGN KEY ("productid") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Images" ADD CONSTRAINT "Images_sizecolorid_fkey" FOREIGN KEY ("sizecolorid") REFERENCES "SizeColor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_productid_fkey" FOREIGN KEY ("productid") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_sizecolorid_fkey" FOREIGN KEY ("sizecolorid") REFERENCES "SizeColor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
