-- CreateEnum
CREATE TYPE "QuantityUnit" AS ENUM ('unidad', 'paquete', 'gramo', 'kilogramo', 'mililitro', 'litro');

-- AlterTable
ALTER TABLE "ShoppingItem" ADD COLUMN "brand" TEXT;
ALTER TABLE "ShoppingItem" ADD COLUMN "quantityAmount" TEXT;
ALTER TABLE "ShoppingItem" ADD COLUMN "quantityUnit" "QuantityUnit";
ALTER TABLE "ShoppingItem" ADD COLUMN "notes" TEXT;
