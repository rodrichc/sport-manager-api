import { Booking } from "@prisma/client"
import { db } from "../../config/db";
import { BookingStatus } from "@prisma/client"
import { subMinutes } from "date-fns";
import { CreateBookingDTO } from "./booking.types"
import { BookingId, ComplexId, CourtId, UserId } from "../../types";
import type { PaginatedResult } from "../../types/pagination";

export class BookingRepository {

    async create(data: CreateBookingDTO & { userId: UserId, totalPrice: number }) {

        return await db.$transaction(async (tx) => {

            const activeCollisions = await tx.booking.findMany({
                where: {
                    courtId: data.courtId,
                    status: { not: BookingStatus.CANCELLED },
                    AND: [
                        { startTime: { lt: data.endTime } },
                        { endTime: { gt: data.startTime } }
                    ]
                }
            })

            for (const collision of activeCollisions) {
                if (collision.status === BookingStatus.PENDING) {
                    const EXPIRATION_MINUTES = 10;
                    const isExpired = new Date().getTime() - collision.createdAt.getTime() > EXPIRATION_MINUTES * 60000;
                    
                    if (isExpired) {
                        await tx.booking.update({
                            where: { id: collision.id },
                            data: { status: BookingStatus.CANCELLED }
                        })
                        continue;
                    }
                }
                throw new Error("COLLISION_DETECTED")
            }

            return await tx.booking.create({
                data: {
                    courtId: data.courtId,
                    userId: data.userId,
                    startTime: data.startTime,
                    endTime: data.endTime,
                    totalPrice: data.totalPrice,
                    status: BookingStatus.PENDING
                }
            })
        })
    }

    async getCourtPrice(courtId: CourtId) {
        return await db.court.findUnique({
            where: { id: courtId },
            select: { name: true, price: true, complexId: true, isActive: true }
        })
    }

    async getComplexConfig(complexId: ComplexId) {
        return await db.complex.findUnique({
            where: { id: complexId },
            select: { minBookingDuration: true, maxBookingDuration: true }
        })
    }

    async getComplexSchedule(complexId: number, dayOfWeek: number) {
        return await db.complexSchedule.findFirst({
            where: {
                complexId,
                dayOfWeek
            }
        })
    }

    async findBookingsInRange(courtId: number, start: Date, end: Date) {
        const tenMinutesAgo = subMinutes(new Date(), 10);

        return await db.booking.findMany({
            where: {
                courtId,
                
                startTime: { lt: end },
                endTime: { gt: start },
                
                OR: [
                    { status: BookingStatus.CONFIRMED },
                    {
                        status: BookingStatus.PENDING,
                        createdAt: { gt: tenMinutesAgo } 
                    }
                ]
            }
        });
    }

    async findByUserId(userId: UserId): Promise<Booking[]>
    async findByUserId(userId: UserId, pagination: { skip: number; take: number }): Promise<PaginatedResult<Booking>>
    async findByUserId(userId: UserId, pagination?: { skip: number; take: number }): Promise<Booking[] | PaginatedResult<Booking>> {
        const where = { userId }

        const include = {
            court: {
                include: {
                    complex: true
                }
            }
        }

        const orderBy = {
            startTime: 'desc' as const
        }

        if (pagination) {
            const [items, total] = await Promise.all([
                db.booking.findMany({
                    where,
                    include,
                    orderBy,
                    skip: pagination.skip,
                    take: pagination.take
                }),
                db.booking.count({ where })
            ])
            return { items, total }
        }

        return await db.booking.findMany({
            where,
            include,
            orderBy
        })
    }

    async delete(id: BookingId) {
    return await db.booking.delete({
        where: { id }
    });
}
}
