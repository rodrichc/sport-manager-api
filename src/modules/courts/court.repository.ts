import { db } from "../../config/db"
import { UserId, ComplexId, CourtId } from "../../types"
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

    async findActiveCourt(id: CourtId){
        return await db.court.findFirst({
            where: {
                id,
                isActive: true
            }
        })
    }

    async findCourt(id: CourtId){
        return await db.court.findFirst({
            where: {
                id,
                deletedAt: null
            }
        })
    }

    async update(id: CourtId, data: CourtDTO){
        return await db.court.update({
            where: { id },
            data
        })
    }

    async softDelete(id: CourtId, data: DeleteCourtDTO){
        return await db.court.update({
            where: { id },
            data
        })
    }

    async findCourtsByUserId(userId: UserId){
        return await db.court.findMany({
            where: {
                deletedAt: null,
                complex: {
                    ownerId: userId
                }
            }
        })
    }

    async findDeletedCourtsByUserId(userId: UserId){
        return await db.court.findMany({
            where: {
                deletedAt: { not: null },
                complex: {
                    ownerId: userId
                }
            }
        })
    }

    async findAllCourts() {
        return await db.court.findMany({
            where: { 
                deletedAt: null
            } 
        })
    }

    async findDeletedCourt(id: CourtId) {
        return await db.court.findFirst({
            where: {
                id,
                deletedAt: { not: null }
            }
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
