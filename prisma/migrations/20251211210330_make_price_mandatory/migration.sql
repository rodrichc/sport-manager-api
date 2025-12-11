/*
  Warnings:

  - Made the column `price` on table `Court` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Court" ALTER COLUMN "price" SET NOT NULL;
