import { db } from "../../config/db"
import { UserId, ComplexId } from "../../types"
import { CreateCourtDTO } from "./court.types"

export class CourtRepository {

    async findComplexOwner(complexId: ComplexId, userId: UserId) {
        return await db.complex.findFirst({
            where: {
                id: complexId,
                ownerId: userId
            }
        })
    }

    async create(data: CreateCourtDTO) {
        return await db.court.create({ data })
    }

    async findAllActiveCourts() {
        return await db.court.findMany({
            where: { isActive: true }
        })
    }
}
