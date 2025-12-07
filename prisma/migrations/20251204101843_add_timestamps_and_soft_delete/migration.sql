/*
  Warnings:

  - Added the required column `updatedAt` to the `Complex` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Complex" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
