import { ComplexId, UserSafe } from "../../types";
import { AppError } from "../../utils/appError";
import { ReviewRepository } from "./review.repository";
import { CreateReviewDTO, UpdateReviewDTO } from "./review.types";

export class ReviewService {
    constructor(private readonly reviewRepository: ReviewRepository) {}

    async create(data: CreateReviewDTO, user: UserSafe, complexId: ComplexId) {

        const ownerId = await this.reviewRepository.findComplexOwner(complexId);
        if (!ownerId) {
            throw new AppError("El complejo no existe", 404);
        }

        if (ownerId === user.id) {
            throw new AppError("No puedes calificar tu propio complejo", 403);
        }

        const hasCompletedBooking = await this.reviewRepository.hasCompletedBooking(user.id, complexId);
        if (!hasCompletedBooking) {
            throw new AppError("Debes tener al menos una reserva completada en este complejo para poder opinar", 403);
        }

        const existingReview = await this.reviewRepository.findUserReview(user.id, complexId);
        if (existingReview) {
            throw new AppError("Ya calificaste este complejo. Puedes editar tu reseña existente", 409);
        }

        return await this.reviewRepository.create(user.id, complexId, data);
    }

    async update(data: UpdateReviewDTO, user: UserSafe, complexId: ComplexId) {
        const review = await this.reviewRepository.findUserReview(user.id, complexId);
        if (!review) {
            throw new AppError("No tienes ninguna reseña registrada en este complejo", 404);
        }

        return await this.reviewRepository.update(user.id, complexId, data);
    }

    async delete(user: UserSafe, complexId: ComplexId) {
        const review = await this.reviewRepository.findUserReview(user.id, complexId);
        if (!review) {
            throw new AppError("No tienes ninguna reseña registrada en este complejo", 404);
        }

        return await this.reviewRepository.delete(user.id, complexId);
    }

    async getByComplexId(complexId: ComplexId) {
        const ownerId = await this.reviewRepository.findComplexOwner(complexId);
        if (!ownerId) {
            throw new AppError("El complejo no existe", 404);
        }

        return await this.reviewRepository.findByComplexId(complexId);
    }
}