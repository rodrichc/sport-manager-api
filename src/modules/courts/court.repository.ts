import { db } from "../../config/db";
import { complexId, CreateCourtDTO, userId } from "./court.types";

export const courtRepository = {
    findComplexOwner: async (complexId: complexId, userId: userId) => {
        return await db.complex.findFirst({
            where: {
                id: complexId,
                ownerId: userId
            }
        })
    },

    create(data: CreateCourtDTO) {
        return db.court.create({ data });
    },
}
