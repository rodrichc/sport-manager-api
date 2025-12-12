import { db } from "../../config/db";
import { CreateCourtDTO, complexId, userId } from "./court.types";

export class CourtRepository {

    async findComplexOwner(complexId: complexId, userId: userId) {
        return await db.complex.findFirst({
            where: {
                id: complexId,
                ownerId: userId
            }
        });
    }

    async create(data: CreateCourtDTO) {
        return await db.court.create({ data });
    }

    async findAllActiveCourts() {
        return await db.court.findMany({
            where: { isActive: true }
        });
    }
}
