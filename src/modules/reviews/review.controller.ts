import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { AppError } from "../../utils/appError";
import { ReviewService } from "./review.service";
import { CreateReviewDTO, UpdateReviewDTO } from "./review.types";

export class ReviewController {
    constructor(private readonly reviewService: ReviewService) {}

    create = catchAsync(async (req: Request, res: Response) => {
        const complexId = this.parseComplexId(req.params.id);
        const reviewData: CreateReviewDTO = req.body;
        const userData = req.user;

        const newReview = await this.reviewService.create(reviewData, userData, complexId);

        res.status(201).json({
            message: "Reseña creada exitosamente",
            review: newReview
        });
    });

    update = catchAsync(async (req: Request, res: Response) => {
        const complexId = this.parseComplexId(req.params.id);
        const updateData: UpdateReviewDTO = req.body;
        const userData = req.user;

        const updatedReview = await this.reviewService.update(updateData, userData, complexId);

        res.json({
            message: "Reseña actualizada exitosamente",
            review: updatedReview
        });
    });

    delete = catchAsync(async (req: Request, res: Response) => {
        const complexId = this.parseComplexId(req.params.id);
        const userData = req.user;

        await this.reviewService.delete(userData, complexId);

        res.json({
            message: "Reseña eliminada exitosamente"
        });
    });

    getByComplexId = catchAsync(async (req: Request, res: Response) => {
        const complexId = this.parseComplexId(req.params.id);
        const reviewsData = await this.reviewService.getByComplexId(complexId);

        res.json({
            data: reviewsData
        });
    });

    private parseComplexId(paramId: string): number {
        const complexId = Number(paramId);
        if (isNaN(complexId) || !Number.isInteger(complexId) || complexId <= 0) {
            throw new AppError("El ID del complejo debe ser un número entero válido", 400);
        }
        return complexId;
    }
}