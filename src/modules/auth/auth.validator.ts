import { body } from 'express-validator'
import { handleInputErrors } from '../../middleware/validation'


export const validateRegister = [
    body('name')
        .notEmpty()
        .withMessage('El Nombre es obligatorio.'),
    body('email')
        .isEmail()
        .withMessage('Email no válido.'),
    body('username')
        .notEmpty()
        .withMessage('El Nombre de Usuario es obligatorio.'),
    body('password')
        .isLength({min: 8})
        .withMessage('La Contraseña debe ser de al menos de 8 caracteres.'),
    body('role')
        .optional()
        .isIn(['USER', 'OWNER'])
        .withMessage('Rol inválido'),
    body('phoneNumber')
        .optional()
        .matches(/^[0-9]+$/)
        .withMessage('Poné solo números, sin guiones ni espacios')
        .isLength({ min: 10, max: 15 })
        .withMessage('El número debe tener al menos 10 dígitos'),
        
    handleInputErrors, 
]


export const validateLogin = [
    body('email')
        .isEmail()
        .withMessage('Email no válido.'),
    body('password')
        .notEmpty()
        .withMessage('La contraseña es obligatoria'),

    handleInputErrors, 
]

export const validateBecomeOwner = [
    body('phoneNumber')
        .notEmpty()
        .withMessage('El teléfono es obligatorio')
        .matches(/^[0-9]+$/)
        .withMessage('Poné solo números, sin guiones ni espacios')
        .isLength({ min: 10, max: 15 })
        .withMessage('El número debe tener al menos 10 dígitos (Ej: 351...)'),

    handleInputErrors, 
]
