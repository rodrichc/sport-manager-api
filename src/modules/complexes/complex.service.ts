import { Complex, Court } from "@prisma/client";
import { ComplexId, UserId, UserSafe } from "../../types";
import type { PaginatedResponse, PaginationQuery } from "../../types/pagination";
import { AppError } from "../../utils/appError";
import { paginateResponse } from "../../utils/paginate";
import { ComplexRepository } from "./complex.repository";
import { ComplexStatus, CreateComplexDTO, ScheduleInput, UpdateComplexDTO } from "./complex.types";
import { IStorageService } from "../../services/storage/IStorageService";


export class ComplexService {

    constructor(
        private readonly complexRepository: ComplexRepository,
        private readonly storageService: IStorageService
    ) { }

    async create(data: CreateComplexDTO, user: UserSafe) {

        if (user.role !== "OWNER") {
            throw new AppError("Debe tener una cuenta de tipo Dueño para crear un Complejo", 403)
        }

        return await this.complexRepository.create(data, user.id)
    }

    async getAllActive(search?: string): Promise<any[]>
    async getAllActive(pagination: PaginationQuery, search?: string): Promise<PaginatedResponse<any>>
    async getAllActive(paginationOrSearch?: PaginationQuery | string, searchOpt?: string) {
        let pagination;
        let search;
        
        if (typeof paginationOrSearch === 'string') {
            search = paginationOrSearch;
        } else {
            pagination = paginationOrSearch;
            search = searchOpt;
        }

        if (!pagination) {
            const complexes = await this.complexRepository.findAllActive(search)
            return this.mapComplexesWithWhatsapp(complexes)
        }

        const { items, total } = await this.complexRepository.findAllActive({
            skip: pagination.skip,
            take: pagination.take
        }, search)

        return paginateResponse(this.mapComplexesWithWhatsapp(items), total, pagination.page, pagination.pageSize)
    }

    private mapComplexesWithWhatsapp(complexes: any[]) {
        return complexes.map((c: any) => {
            const phone = c.owner?.phoneNumber || "5491100000000";
            return {
                ...c,
                whatsappLink: `https://wa.me/${phone.replace(/[^0-9]/g, '')}`
            };
        });
    }

    async update(data: UpdateComplexDTO, user: UserSafe, id: ComplexId) {
        const complex = await this.complexRepository.findActiveById(id)
        this.getComplexOrThrow(complex, user)

        if (data.logo && complex.logo && data.logo !== complex.logo) {
            await this.storageService.deleteFile(complex.logo);
        }

        if (data.images && Array.isArray(data.images)) {
            const imagesToDelete = complex.images.filter(
                (oldUrl) => !data.images!.includes(oldUrl)
            );

            if (imagesToDelete.length > 0) {
                await Promise.all(
                    imagesToDelete.map((url) => this.storageService.deleteFile(url))
                );
            }
        }

        return await this.complexRepository.update(id, data)
    }

    async delete(user: UserSafe, id: ComplexId) {
        const complex = await this.complexRepository.findActiveById(id)
        this.getComplexOrThrow(complex, user)

        return await this.complexRepository.softDelete(id, { deletedAt: new Date() })
    }

    async findByOwnerActive(user: UserSafe): Promise<Complex[]>
    async findByOwnerActive(user: UserSafe, pagination: PaginationQuery): Promise<PaginatedResponse<Complex>>
    async findByOwnerActive(user: UserSafe, pagination?: PaginationQuery) {
        if (!pagination) {
            return await this.complexRepository.findActiveByOwner(user.id)
        }

        const { items, total } = await this.complexRepository.findActiveByOwner(user.id, {
            skip: pagination.skip,
            take: pagination.take
        })

        return paginateResponse(items, total, pagination.page, pagination.pageSize)
    }

    async findByOwnerDeleted(user: UserSafe): Promise<Complex[]>
    async findByOwnerDeleted(user: UserSafe, pagination: PaginationQuery): Promise<PaginatedResponse<Complex>>
    async findByOwnerDeleted(user: UserSafe, pagination?: PaginationQuery) {
        if (!pagination) {
            return await this.complexRepository.findDeletedByOwner(user.id)
        }

        const { items, total } = await this.complexRepository.findDeletedByOwner(user.id, {
            skip: pagination.skip,
            take: pagination.take
        })

        return paginateResponse(items, total, pagination.page, pagination.pageSize)
    }

    async restore(user: UserSafe, id: ComplexId) {
        const complex = await this.complexRepository.findById(id)

        this.getComplexOrThrow(complex, user)

        if (!complex.deletedAt) {
            throw new AppError("El complejo no está eliminado", 400)
        }

        return await this.complexRepository.restore(id)
    }

    async hardDelete(user: UserSafe, id: ComplexId) {
        const complex = await this.complexRepository.findById(id)

        this.getComplexOrThrow(complex, user)

        if (!complex.deletedAt) {
            throw new AppError("El complejo no está eliminado", 400)
        }

        const filesToDelete: string[] = [];
        if (complex.logo) {
            filesToDelete.push(complex.logo);
        }

        if (complex.images && complex.images.length > 0) {
            filesToDelete.push(...complex.images);
        }

        if (filesToDelete.length > 0) {
            await Promise.all(
                filesToDelete.map((url) => this.storageService.deleteFile(url))
            );
        }

        return await this.complexRepository.hardDelete(id)
    }

    async updateStatus(user: UserSafe, id: ComplexId, status: ComplexStatus) {
        if (user.role !== "ADMIN") {
            throw new AppError('Acción no autorizada. Solo Administradores', 403)
        }

        return await this.complexRepository.update(id, { status })
    }


    async updateSchedules(id: ComplexId, userData: UserSafe, schedules: ScheduleInput[]) {
        const complex = await this.complexRepository.findActiveById(id)

        this.getComplexOrThrow(complex, userData)

        return await this.complexRepository.updateSchedules(complex.id, schedules)
    }


    async findByComplex(complexId: ComplexId): Promise<Court[]>
    async findByComplex(complexId: ComplexId, pagination: PaginationQuery): Promise<PaginatedResponse<Court>>
    async findByComplex(complexId: ComplexId, pagination?: PaginationQuery) {
        if (!pagination) {
            return await this.complexRepository.findCourtsById(complexId)
        }

        const { items, total } = await this.complexRepository.findCourtsById(complexId, {
            skip: pagination.skip,
            take: pagination.take
        })

        return paginateResponse(items, total, pagination.page, pagination.pageSize)
    }


    private getComplexOrThrow(complex: Complex | null, user: UserSafe) {
        if (!complex) {
            throw new AppError('Complejo no encontrado', 404)
        }

        if (complex.ownerId !== user.id && user.role !== "ADMIN") {
            throw new AppError('Acción no válida. No eres dueño de este complejo.', 403)
        }
    }
}
