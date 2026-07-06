import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { ReviewService } from "./review.service";
import { CreateReviewDTO } from "./review.types";

export class ReviewController {
    constructor(private readonly reviewService: ReviewService) {}

    create = catchAsync(async (req: Request, res: Response) => {
        const reviewData: CreateReviewDTO = req.body;
        const userData = req.user;
        const complexId = Number(req.params.id);

        const newReview = await this.reviewService.create(reviewData, userData, complexId);

        res.status(201).json({
            message: "Reseña creada exitosamente.",
            review: newReview
        });
    });

    getByComplexId = catchAsync(async (req: Request, res: Response) => {
        const complexId = Number(req.params.id);
        const reviews = await this.reviewService.getByComplexId(complexId);

        res.json({ data: reviews });
    });
}
