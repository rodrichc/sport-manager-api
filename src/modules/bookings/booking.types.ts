import { Booking } from "@prisma/client";


export type CreateBookingDTO = Pick<Booking, "courtId" | "startTime" | "endTime">