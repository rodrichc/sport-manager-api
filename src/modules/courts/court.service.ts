import { Court } from "@prisma/client"
import { ComplexId, CourtId, UserId } from "../../types"
import type { PaginatedResponse, PaginationQuery } from "../../types/pagination"
import { AppError } from "../../utils/appError"
import { paginateResponse } from "../../utils/paginate"
import { CourtRepository } from "./court.repository"
import { CourtDTO } from "./court.types"
import { IStorageService } from "../../services/storage/IStorageService"

export class CourtService {

    constructor(
        private readonly courtRepository: CourtRepository,
        private readonly storageService: IStorageService
    ) { }

    async create(userId: UserId, courtData: CourtDTO) {
        await this.getComplexOrThrow(courtData.complexId, userId)

        return await this.courtRepository.create(courtData)
    }


    async findActive(id: CourtId) {
        const court = await this.courtRepository.findActiveCourt(id)

        if (!court) {
            throw new AppError("No existe un cancha con este ID", 404)
        }

        return court
    }


    async update(id: CourtId, userId: UserId, courtData: CourtDTO) {
        const court = await this.getCourtOrThrow(id)

        await this.getComplexOrThrow(court.complexId, userId)

        if (courtData.images && Array.isArray(courtData.images)) {
            const imagesToDelete = court.images.filter(
                (oldUrl) => !courtData.images!.includes(oldUrl)
            )

            if (imagesToDelete.length > 0) {
                await Promise.all(
                    imagesToDelete.map((url) => this.storageService.deleteFile(url))
                )
            }
        }

        return await this.courtRepository.update(id, courtData)
    }


    async delete(id: CourtId, userId: UserId) {
        const court = await this.getCourtOrThrow(id)

        await this.getComplexOrThrow(court.complexId, userId)

        return await this.courtRepository.softDelete(id, { deletedAt: new Date(), isActive: false })
    }


    async findAll(): Promise<Court[]>
    async findAll(pagination: PaginationQuery): Promise<PaginatedResponse<Court>>
    async findAll(pagination?: PaginationQuery) {
        if (pagination) {
            const { items, total } = await this.courtRepository.findAllCourts({
                skip: pagination.skip,
                take: pagination.take
            })

            return paginateResponse(items, total, pagination.page, pagination.pageSize)
        }

        const courts = await this.courtRepository.findAllCourts()

        if (courts.length === 0) {
            throw new AppError("No se encontraron canchas activas", 404)
        }

        return courts
    }


    async findCourtsUser(userId: UserId): Promise<Court[]>
    async findCourtsUser(userId: UserId, pagination: PaginationQuery): Promise<PaginatedResponse<Court>>
    async findCourtsUser(userId: UserId, pagination?: PaginationQuery) {
        if (pagination) {
            const { items, total } = await this.courtRepository.findCourtsByUserId(userId, {
                skip: pagination.skip,
                take: pagination.take
            })

            return paginateResponse(items, total, pagination.page, pagination.pageSize)
        }

        const courts = await this.courtRepository.findCourtsByUserId(userId)

        if (courts.length === 0) {
            throw new AppError("No se encontraron canchas activas", 404)
        }

        return courts
    }


    async findDeletedCourtsUser(userId: UserId): Promise<Court[]>
    async findDeletedCourtsUser(userId: UserId, pagination: PaginationQuery): Promise<PaginatedResponse<Court>>
    async findDeletedCourtsUser(userId: UserId, pagination?: PaginationQuery) {
        if (pagination) {
            const { items, total } = await this.courtRepository.findDeletedCourtsByUserId(userId, {
                skip: pagination.skip,
                take: pagination.take
            })

            return paginateResponse(items, total, pagination.page, pagination.pageSize)
        }

        const courts = await this.courtRepository.findDeletedCourtsByUserId(userId)

        if (courts.length === 0) {
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

        if (court.images && court.images.length > 0) {
            await Promise.all(
                court.images.map((url) => this.storageService.deleteFile(url))
            )
        }

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

        if (!court) {
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
