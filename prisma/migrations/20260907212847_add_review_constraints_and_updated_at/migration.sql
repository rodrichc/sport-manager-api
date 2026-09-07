/*
  Warnings:

  - A unique constraint covering the columns `[userId,complexId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Review_userId_complexId_key" ON "Review"("userId", "complexId");
