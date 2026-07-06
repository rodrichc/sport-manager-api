import { Court } from "@prisma/client"
import { db } from "../../config/db"
import { UserId, ComplexId, CourtId } from "../../types"
import type { PaginatedResult } from "../../types/pagination"
import { CourtDTO, DeleteCourtDTO } from "./court.types"

export class CourtRepository {

    async findComplexByOwner(complexId: ComplexId, userId: UserId) {
        return await db.complex.findFirst({
            where: {
                id: complexId,
                ownerId: userId
            }
        })
    }

    async create(data: CourtDTO) {
        return await db.court.create({ data })
    }

    async findActiveCourt(id: CourtId) {
        return await db.court.findFirst({
            where: {
                id,
                isActive: true
            },
            include: { complex: true }
        })
    }

    async findCourt(id: CourtId) {
        return await db.court.findFirst({
            where: {
                id
            },
            include: { complex: true }
        })
    }

    async update(id: CourtId, data: CourtDTO) {
        return await db.court.update({
            where: { id },
            data
        })
    }

    async softDelete(id: CourtId, data: DeleteCourtDTO) {
        return await db.court.update({
            where: { id },
            data
        })
    }

    async findCourtsByUserId(userId: UserId): Promise<Court[]>
    async findCourtsByUserId(userId: UserId, pagination: { skip: number; take: number }): Promise<PaginatedResult<Court>>
    async findCourtsByUserId(userId: UserId, pagination?: { skip: number; take: number }): Promise<Court[] | PaginatedResult<Court>> {
        const where = {
            complex: {
                ownerId: userId
            }
        }

        if (pagination) {
            const [items, total] = await Promise.all([
                db.court.findMany({
                    where,
                    skip: pagination.skip,
                    take: pagination.take,
                    include: { complex: true }
                }),
                db.court.count({ where })
            ])
            return { items, total }
        }

        return await db.court.findMany({
            where,
            include: { complex: true }
        })
    }

    async findDeletedCourtsByUserId(userId: UserId): Promise<Court[]>
    async findDeletedCourtsByUserId(userId: UserId, pagination: { skip: number; take: number }): Promise<PaginatedResult<Court>>
    async findDeletedCourtsByUserId(userId: UserId, pagination?: { skip: number; take: number }): Promise<Court[] | PaginatedResult<Court>> {
        const where = {
            deletedAt: { not: null },
            complex: {
                ownerId: userId
            }
        }

        if (pagination) {
            const [items, total] = await Promise.all([
                db.court.findMany({
                    where,
                    skip: pagination.skip,
                    take: pagination.take,
                    include: { complex: true }
                }),
                db.court.count({ where })
            ])
            return { items, total }
        }

        return await db.court.findMany({
            where,
            include: { complex: true }
        })
    }

    async findAllCourts(): Promise<Court[]>
    async findAllCourts(pagination: { skip: number; take: number }): Promise<PaginatedResult<Court>>
    async findAllCourts(pagination?: { skip: number; take: number }) {
        const where = {
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

    async findDeletedCourt(id: CourtId) {
        return await db.court.findFirst({
            where: {
                id,
                deletedAt: { not: null }
            },
            include: { complex: true }
        })
    }

    async restore(id: CourtId) {
        return await db.court.update({
            where: { id },
            data: {
                deletedAt: null,
                isActive: false
            }
        })
    }

    async hardDelete(id: CourtId) {
        return await db.court.delete({
            where: { id }
        })
    }
}
