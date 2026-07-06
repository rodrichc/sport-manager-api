import { ReviewRepository } from "./review.repository";
import { ReviewService } from "./review.service";
import { ReviewController } from "./review.controller";

const reviewRepository = new ReviewRepository();
export const reviewService = new ReviewService(reviewRepository);
export const reviewController = new ReviewController(reviewService);
