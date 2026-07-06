import { body } from "express-validator";
import { handleInputErrors } from "../../middleware/validation";

export const validateCreateReview = [
    body("rating")
        .isInt({ min: 1, max: 5 }).withMessage("El rating debe ser un número entero entre 1 y 5"),
    body("comment")
        .optional()
        .isString().withMessage("El comentario debe ser texto")
        .isLength({ max: 500 }).withMessage("El comentario no puede exceder los 500 caracteres"),
    handleInputErrors
];
