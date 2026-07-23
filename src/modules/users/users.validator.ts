import { body } from "express-validator"
import { handleInputErrors } from "../../middleware/validation"
import { validatePhoneNumberOptional } from "../../validators/common"

export const validateUpdateProfile = [
    body('name').optional().notEmpty().withMessage('El nombre no puede ir vacío'),
    validatePhoneNumberOptional,
    body('avatar').optional().isString(),
    handleInputErrors
]

export const validateUpdatePassword = [
    body('currentPassword').notEmpty().withMessage('La contraseña actual es obligatoria'),
    body('newPassword').isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres'),
    handleInputErrors
]
