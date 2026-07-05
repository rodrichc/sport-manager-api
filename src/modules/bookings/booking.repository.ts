import { Booking } from "@prisma/client"
import { db } from "../../config/db";
import { BookingStatus } from "@prisma/client"
import { CreateBookingDTO } from "./booking.types"
import { ComplexId, CourtId, UserId } from "../../types";
import type { PaginatedResult } from "../../types/pagination";

export class BookingRepository {

    async create(data: CreateBookingDTO & { userId: UserId, totalPrice: number }) {

        return await db.$transaction(async (tx) => {

            const busy = await tx.booking.findFirst({
                where: {
                    courtId: data.courtId,
                    status: { not: BookingStatus.CANCELLED },
                    AND: [
                        { startTime: { lt: data.endTime } },
                        { endTime: { gt: data.startTime } }
                    ]
                }
            })

            if (busy) {
                throw new Error("COLLISION_DETECTED")
            }

            return await tx.booking.create({
                data: {
                    courtId: data.courtId,
                    userId: data.userId,
                    startTime: data.startTime,
                    endTime: data.endTime,
                    totalPrice: data.totalPrice,
                    status: BookingStatus.CONFIRMED
                }
            })
        })
    }

    async getCourtPrice(courtId: CourtId) {
        return await db.court.findUnique({
            where: { id: courtId },
            select: { price: true, complexId: true, isActive: true }
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

    async findBookingsInRange(courtId: number, rangeStart: Date, rangeEnd: Date) {
        return await db.booking.findMany({
            where: {
                courtId: courtId,
                startTime: {
                    lt: rangeEnd
                },
                endTime: {
                    gt: rangeStart
                },
                status: {
                    not: 'CANCELLED'
                }
            }
        });
    }

    async findByUserId(userId: UserId): Promise<Booking[]>
    async findByUserId(userId: UserId, pagination: { skip: number; take: number }): Promise<PaginatedResult<Booking>>
    async findByUserId(userId: UserId, pagination?: { skip: number; take: number }) {
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
}
