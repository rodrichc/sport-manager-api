import { courtRepository } from "./court.repository";
import { CreateCourtDTO, userId } from "./court.types";

export const CourtService = {
    createCourt: async (userId: userId, courtData: CreateCourtDTO) => {
        const complex = await courtRepository.findComplexOwner(courtData.complexId, userId);
        
        if (!complex) {
            throw new Error('PERMISO_DENEGADO');
        }

        return await courtRepository.create(courtData);
    },

    
}