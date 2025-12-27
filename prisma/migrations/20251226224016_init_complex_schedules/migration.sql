/*
  Warnings:

  - You are about to drop the column `closeTime` on the `Complex` table. All the data in the column will be lost.
  - You are about to drop the column `openTime` on the `Complex` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Complex` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Court" DROP CONSTRAINT "Court_complexId_fkey";

-- AlterTable
ALTER TABLE "Complex" DROP COLUMN "closeTime",
DROP COLUMN "openTime",
DROP COLUMN "status";

-- CreateTable
CREATE TABLE "ComplexSchedule" (
    "id" SERIAL NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "complexId" INTEGER NOT NULL,

    CONSTRAINT "ComplexSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ComplexSchedule_complexId_dayOfWeek_idx" ON "ComplexSchedule"("complexId", "dayOfWeek");

-- AddForeignKey
ALTER TABLE "ComplexSchedule" ADD CONSTRAINT "ComplexSchedule_complexId_fkey" FOREIGN KEY ("complexId") REFERENCES "Complex"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Court" ADD CONSTRAINT "Court_complexId_fkey" FOREIGN KEY ("complexId") REFERENCES "Complex"("id") ON DELETE CASCADE ON UPDATE CASCADE;
