import { CourtRepository } from "./court.repository"
import { CreateCourtDTO, userId } from "./court.types"

export class CourtService {
    
    constructor(private readonly courtRepository: CourtRepository) {}

    async createCourt(userId: userId, courtData: CreateCourtDTO) {

        const complex = await this.courtRepository.findComplexOwner(courtData.complexId, userId);
        
        if (!complex) {
            throw new Error('PERMISO_DENEGADO');
        }

        return await this.courtRepository.create(courtData);
    }

    async getCourts() {
        return await this.courtRepository.findAllActiveCourts();
    }
}
