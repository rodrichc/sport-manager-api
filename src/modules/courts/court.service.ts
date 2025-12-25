import { ComplexId, CourtId, UserId } from "../../types"
import { AppError } from "../../utils/appError"
import { CourtRepository } from "./court.repository"
import { CourtDTO } from "./court.types"

export class CourtService {
    
    constructor(private readonly courtRepository: CourtRepository) {}

    async create(userId: UserId, courtData: CourtDTO) {
        await this.getComplexOrThrow(courtData.complexId, userId)
    
        return await this.courtRepository.create(courtData)
    }
    
    
    async findActive(id: CourtId) {
        const court = await this.courtRepository.findActiveCourt(id)

        if(!court){
            throw new AppError("No existe un cancha con este ID", 404)
        }

        return court
    }


    async update(id: CourtId,userId: UserId, courtData: CourtDTO){
        const court = await this.getCourtOrThrow(id)
        
        await this.getComplexOrThrow(court.complexId, userId)

        return await this.courtRepository.update(id, courtData)
    }


    async delete(id: CourtId, userId: UserId){
        const court = await this.getCourtOrThrow(id)

        await this.getComplexOrThrow(court.complexId, userId)
        
        return await this.courtRepository.softDelete(id, {deletedAt: new Date(), isActive: false})
    }


    async findAll() {
        const courts = await this.courtRepository.findAllCourts()

        if(courts.length === 0){
            throw new AppError("No se encontraron canchas activas", 404)
        }

        return courts
    }


    async findCourtsUser(userId: UserId) {
        const courts = await this.courtRepository.findCourtsByUserId(userId)

        if(courts.length === 0){
            throw new AppError("No se encontraron canchas activas", 404)
        }

        return courts
    }


    async findDeletedCourtsUser(userId: UserId) {
        const courts = await this.courtRepository.findDeletedCourtsByUserId(userId)

        if(courts.length === 0){
            throw new AppError("No se encontraron canchas en papelera", 404)
        }

        return courts
    }


    async restore(id: CourtId, userId: UserId) {
        const court = await this.getCourtDeletedOrThrow(id)

        await this.getComplexOrThrow(court.complexId, userId)

        return await this.courtRepository.restore(id)
    }

    
    async hardDelete(id: CourtId, userId: UserId) {
        const court = await this.getCourtDeletedOrThrow(id)

        await this.getComplexOrThrow(court.complexId, userId)

        return await this.courtRepository.hardDelete(id)
    }


    // PRIVATE FUNCTIONS

    private async getComplexOrThrow(complexId: ComplexId, userId: UserId) {
        const complex = await this.courtRepository.findComplexByOwner(complexId, userId)
        
        if (!complex) {
            throw new AppError('No tenés permiso sobre este complejo', 403)
        }
    }

    private async getCourtOrThrow(id: CourtId) {
        const court = await this.courtRepository.findCourt(id)

        if(!court) {
            throw new AppError('Cancha inexistente.', 404)
        }

        return court
    }

    private async getCourtDeletedOrThrow(id: CourtId) {
        const court = await this.courtRepository.findDeletedCourt(id)

        if (!court) {
            throw new AppError("No se encontró la cancha en la papelera", 404)
        }

        return court
    }
}
