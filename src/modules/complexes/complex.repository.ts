import { db } from "../../config/db"
import { userId } from "../../types"
import { complexId } from "../courts/court.types"
import { CreateComplexDTO, DeleteComplexDTO, findComplexesCondition, idComplex, UpdateComplexDTO } from "./complex.types"

export class ComplexRepository {

    async create(data: CreateComplexDTO) {
        return await db.complex.create({
            data
        })
    }

    async findAll(whereCondition: findComplexesCondition) {
        return await db.complex.findMany({
            where: whereCondition
        })
    }

    async findById(id: idComplex) {
        return await db.complex.findUnique({
            where: {
                id
            }
        })
    }
    
    async findActiveById(id: idComplex){
        return await db.complex.findFirst({
            where: {
                id,
                deletedAt: null
            }
        })
    }

    async update(id: idComplex, data: UpdateComplexDTO) {
        return await db.complex.update({
            where: {
                id
            },
            data
        })
    }

    async softDelete(id: idComplex, data: DeleteComplexDTO){
        return await db.complex.update({
            where: { id },
            data
        })
    }

    async findActiveByOwner(id: userId){
        return await db.complex.findMany({
            where: {
                id,
                deletedAt: null
            }
        })
    }

    async findDeletedByOwner(id: userId){
        return await db.complex.findMany({
            where: {
                id,
                deletedAt: {not: null}
            }
        })
    }

    async restore(id: idComplex){
        return await db.complex.update({
            where: { id },
            data: { deletedAt: null }
        })
    }
}
