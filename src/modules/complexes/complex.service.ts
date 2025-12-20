import { Complex } from "@prisma/client";
import { ComplexId, UserSafe } from "../../types";
import { AppError } from "../../utils/appError";
import { ComplexRepository } from "./complex.repository";
import { ComplexStatus, CreateComplexDTO, UpdateComplexDTO } from "./complex.types";


export class ComplexService {
    
    constructor(private readonly complexRepository: ComplexRepository) {}

    async create(data: CreateComplexDTO, user: UserSafe) {

        if(user.role !== "OWNER"){
            throw new AppError("Debe tener una cuenta de tipo Dueño para crear un Complejo", 403)
        }

        return await this.complexRepository.create({...data, ownerId: user.id})
    }

    async getAllActive() {
        return await this.complexRepository.findAllActive()
    }

    async update(data: UpdateComplexDTO, user: UserSafe, id: ComplexId) {
        const complex = await this.complexRepository.findActiveById(id)
        this.getComplexOrThrow(complex, user)

        return await this.complexRepository.update(id, data)
    }

    async delete(user: UserSafe, id: ComplexId) {
        const complex = await this.complexRepository.findActiveById(id)
        this.getComplexOrThrow(complex, user)

        return await this.complexRepository.softDelete(id, {deletedAt: new Date()})
    }

    async findByOwnerActive(user: UserSafe) {
        return await this.complexRepository.findActiveByOwner(user.id)
    }

    async findByOwnerDeleted(user: UserSafe) {
        return await this.complexRepository.findDeletedByOwner(user.id)
    }

    async restore(user: UserSafe, id: ComplexId) {
        const complex = await this.complexRepository.findById(id)

        this.getComplexOrThrow(complex, user)

        if(!complex.deletedAt){
            throw new AppError("El complejo no está eliminado", 400)
        }

        return await this.complexRepository.restore(id)
    }

    async updateStatus(user: UserSafe, id: ComplexId, status: ComplexStatus) {
        if(user.role !== "ADMIN") {
            throw new AppError('Acción no autorizada. Solo Administradores', 403)
        }

        return await this.complexRepository.update(id, {status})
    }



    private getComplexOrThrow(complex: Complex | null, user: UserSafe) {
        if(!complex){
            throw new AppError('Complejo no encontrado', 404)
        }

        if(complex.ownerId !== user.id && user.role !== "ADMIN"){
            throw new AppError('Acción no válida. No eres dueño de este complejo.', 403)
        }
    }
}
