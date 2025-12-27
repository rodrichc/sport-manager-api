import { db } from "../../config/db"
import { ComplexId, UserId } from "../../types"
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
            },
            include: {
                schedules: true, 
                courts: true     
            }
        })
    }
    
    async findActiveById(id: ComplexId){
        return await db.complex.findFirst({
            where: {
                id,
                deletedAt: null
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

    async softDelete(id: ComplexId, data: DeleteComplexDTO){
        return await db.complex.update({
            where: { id },
            data
        })
    }

    async findActiveByOwner(userId: UserId){
        return await db.complex.findMany({
            where: {
                ownerId: userId,
                deletedAt: null
            },
            include: {
                schedules: true  
            }
            
        })
    }

    async findDeletedByOwner(userId: UserId){
        return await db.complex.findMany({
            where: {
                ownerId: userId,
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
}
