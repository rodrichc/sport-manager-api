-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_courtId_fkey";

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE CASCADE ON UPDATE CASCADE;
