import { body } from "express-validator"
import { handleInputErrors } from "../../middleware/validation"
import { validatePhoneNumber, validatePhoneNumberOptional } from "../../validators/common"

export const validateRegister = [
    body('name').notEmpty().withMessage('El nombre no puede ir vacío'),
    body('email').isEmail().withMessage('El email no es válido'),
    body('password').isLength({ min: 8 }).withMessage('La contraseña es muy corta'),
    body('username').notEmpty().withMessage('El nombre de usuario no puede ir vacío'),
    body('role').optional().isIn(['USER', 'OWNER']).withMessage('El rol debe ser válido'),
    validatePhoneNumberOptional,
    handleInputErrors
]

export const validateLogin = [
    body('email').isEmail().withMessage('El email no es válido'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria'),
    handleInputErrors
]

export const validateBecomeOwner = [
    validatePhoneNumber,
    handleInputErrors
]

export const validateEmail = [
    body('email').isEmail().withMessage('Debe ser un email válido'),
    handleInputErrors
]

export const validateToken = [
    body('token').notEmpty().withMessage('El token es obligatorio'),
    handleInputErrors
]

export const validateResetPassword = [
    body('token').notEmpty().withMessage('El token es obligatorio'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    handleInputErrors
]

export const validate2FACode = [
    body('code').notEmpty().withMessage('El código es obligatorio'),
    handleInputErrors
]
