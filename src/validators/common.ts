import { body, param, query } from 'express-validator'


export const validateId = param('id')
    .isInt().withMessage('El ID debe ser válido')

export const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page debe ser un entero positivo'),
    query('pageSize')
        .optional()
        .isInt({ min: 1, max: 50 }).withMessage('PageSize debe ser entre 1 y 50'),
]

export const validatePhoneNumber = 
    body('phoneNumber')
        .notEmpty()
        .withMessage('El teléfono es obligatorio')
        .matches(/^[0-9]+$/)
        .withMessage('Poné solo números, sin guiones ni espacios')
        .isLength({ min: 10, max: 15 })
        .withMessage('El número debe tener al menos 10 dígitos (Ej: 351...)')


export const validatePhoneNumberOptional = 
    body('phoneNumber')
        .optional()
        .matches(/^[0-9]+$/)
        .withMessage('Poné solo números, sin guiones ni espacios')
        .isLength({ min: 10, max: 15 })
        .withMessage('El número debe tener al menos 10 dígitos (Ej: 351...)')