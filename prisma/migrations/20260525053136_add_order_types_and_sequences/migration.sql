-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('DELIVERY', 'TAKE_AWAY', 'DINE_IN');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "tableNumber" TEXT,
ADD COLUMN     "type" "OrderType" NOT NULL DEFAULT 'DELIVERY';

-- CreateTable
CREATE TABLE "OrderSequence" (
    "name" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "OrderSequence_pkey" PRIMARY KEY ("name")
);
