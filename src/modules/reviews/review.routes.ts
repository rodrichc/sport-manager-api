import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { reviewController } from "./review.dependencies";
import { validateCreateReview, validateUpdateReview } from "./review.validator";

const router = Router({ mergeParams: true });

router.get('/',
    reviewController.getByComplexId
);


router.post('/', authenticate, validateCreateReview, reviewController.create);
router.patch("/", authenticate, validateUpdateReview, reviewController.update);
router.delete("/", authenticate, reviewController.delete);

export default router;
