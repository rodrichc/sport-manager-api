import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { reviewController } from "./review.dependencies";
import { validateCreateReview } from "./review.validator";

const router = Router({ mergeParams: true });

router.post('/',
    authenticate,
    validateCreateReview,
    reviewController.create
);

router.get('/',
    reviewController.getByComplexId
);

export default router;
