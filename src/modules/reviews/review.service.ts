import { ReviewRepository } from "./review.repository";
import { CreateReviewDTO } from "./review.types";
import { AppError } from "../../utils/appError";
import { UserSafe } from "../../types";

export class ReviewService {
    constructor(private readonly reviewRepository: ReviewRepository) {}

    async create(data: CreateReviewDTO, user: UserSafe, complexId: number) {
        if (user.role !== "USER") {
            // Depending on business rules, maybe only USER can review?
            // But let's allow anyone who has a completed booking.
        }

        const hasCompletedBooking = await this.reviewRepository.hasCompletedBooking(user.id, complexId);
        
        if (!hasCompletedBooking) {
            throw new AppError("Debes tener al menos una reserva completada en este complejo para poder opinar.", 403);
        }

        return await this.reviewRepository.create(user.id, complexId, data);
    }

    async getByComplexId(complexId: number) {
        return await this.reviewRepository.findByComplexId(complexId);
    }
}
