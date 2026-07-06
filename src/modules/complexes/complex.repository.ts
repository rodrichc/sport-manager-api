import { Complex, Court } from "@prisma/client"
import { db } from "../../config/db"
import { ComplexId, UserId } from "../../types"
import type { PaginatedResult } from "../../types/pagination"
import { CreateComplexDTO, DeleteComplexDTO, ScheduleInput, UpdateComplexDTO } from "./complex.types"

export class ComplexRepository {

    async create(data: CreateComplexDTO, ownerId: UserId) {
        const { schedules, ...complexData } = data

        return await db.complex.create({
            data: {
                ...complexData,
                ownerId,

                schedules: {
                    create: schedules
                }
            },
            include: {
                schedules: true
            }
        })
    }

    async findAllActive(): Promise<Complex[]>
    async findAllActive(pagination: { skip: number; take: number }): Promise<PaginatedResult<Complex>>
    async findAllActive(pagination?: { skip: number; take: number }): Promise<Complex[] | PaginatedResult<Complex>> {
        const where: any = {
            status: 'APPROVED'
        }

        if (pagination) {
            const [items, total] = await Promise.all([
                db.complex.findMany({ where, skip: pagination.skip, take: pagination.take }),
                db.complex.count({ where })
            ])
            return { items, total }
        }

        return await db.complex.findMany({ where })
    }

    async findById(id: ComplexId) {
        return await db.complex.findUnique({
            where: {
                id
            },
            include: {
                schedules: true,
                courts: true
            }
        })
    }

    async findActiveById(id: ComplexId) {
        return await db.complex.findFirst({
            where: {
                id
            },
            include: {
                schedules: true,
                courts: true
            }
        })
    }

    async update(id: ComplexId, data: UpdateComplexDTO) {
        return await db.complex.update({
            where: {
                id
            },
            data
        })
    }

    async softDelete(id: ComplexId, data: DeleteComplexDTO) {
        return await db.complex.update({
            where: { id },
            data
        })
    }

    async findActiveByOwner(userId: UserId): Promise<Complex[]>
    async findActiveByOwner(userId: UserId, pagination: { skip: number; take: number }): Promise<PaginatedResult<Complex>>
    async findActiveByOwner(userId: UserId, pagination?: { skip: number; take: number }): Promise<Complex[] | PaginatedResult<Complex>> {
        const where = {
            ownerId: userId
        }

        if (pagination) {
            const [items, total] = await Promise.all([
                db.complex.findMany({
                    where,
                    skip: pagination.skip,
                    take: pagination.take,
                    include: { schedules: true }
                }),
                db.complex.count({ where })
            ])
            return { items, total }
        }

        return await db.complex.findMany({
            where,
            include: {
                schedules: true
            }
        })
    }

    async findDeletedByOwner(userId: UserId): Promise<Complex[]>
    async findDeletedByOwner(userId: UserId, pagination: { skip: number; take: number }): Promise<PaginatedResult<Complex>>
    async findDeletedByOwner(userId: UserId, pagination?: { skip: number; take: number }): Promise<Complex[] | PaginatedResult<Complex>> {
        const where = {
            ownerId: userId,
            deletedAt: { not: null }
        }

        if (pagination) {
            const [items, total] = await Promise.all([
                db.complex.findMany({ where, skip: pagination.skip, take: pagination.take }),
                db.complex.count({ where })
            ])
            return { items, total }
        }

        return await db.complex.findMany({ where })
    }

    async restore(id: ComplexId) {
        return await db.complex.update({
            where: { id },
            data: { deletedAt: null }
        })
    }

    async hardDelete(id: ComplexId) {
        return db.complex.delete({
            where: { id }
        })
    }

    async updateSchedules(complexId: ComplexId, schedules: ScheduleInput[]) {
        return await db.$transaction(async (tx) => {
            await tx.complexSchedule.deleteMany({
                where: { complexId }
            })

            const dataToCreate = schedules.map(s => ({
                ...s,
                complexId
            }))

            await tx.complexSchedule.createMany({
                data: dataToCreate
            })

            return await tx.complexSchedule.findMany({
                where: { complexId }
            })
        })
    }

    async findCourtsById(complexId: ComplexId): Promise<Court[]>
    async findCourtsById(complexId: ComplexId, pagination: { skip: number; take: number }): Promise<PaginatedResult<Court>>
    async findCourtsById(complexId: ComplexId, pagination?: { skip: number; take: number }) {
        const where = {
            complexId,
            isActive: true
        }

        if (pagination) {
            const [items, total] = await Promise.all([
                db.court.findMany({ where, skip: pagination.skip, take: pagination.take }),
                db.court.count({ where })
            ])
            return { items, total }
        }

        return await db.court.findMany({ where })
    }
}
