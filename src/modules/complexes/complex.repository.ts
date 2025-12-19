import { db } from "../../config/db"
import { ComplexId, UserId } from "../../types"
import { CreateComplexDTO, DeleteComplexDTO, UpdateComplexDTO } from "./complex.types"

export class ComplexRepository {

    async create(data: CreateComplexDTO) {
        return await db.complex.create({
            data
        })
    }

    async findAllActive() {
        return await db.complex.findMany({
            where: {
                status: 'APPROVED',
                deletedAt: null
            }
        })
    }

    async findById(id: ComplexId) {
        return await db.complex.findUnique({
            where: {
                id
            }
        })
    }
    
    async findActiveById(id: ComplexId){
        return await db.complex.findFirst({
            where: {
                id,
                deletedAt: null
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

    async softDelete(id: ComplexId, data: DeleteComplexDTO){
        return await db.complex.update({
            where: { id },
            data
        })
    }

    async findActiveByOwner(id: UserId){
        return await db.complex.findMany({
            where: {
                id,
                deletedAt: null
            }
        })
    }

    async findDeletedByOwner(id: UserId){
        return await db.complex.findMany({
            where: {
                id,
                deletedAt: {not: null}
            }
        })
    }

    async restore(id: ComplexId){
        return await db.complex.update({
            where: { id },
            data: { deletedAt: null }
        })
    }
}
