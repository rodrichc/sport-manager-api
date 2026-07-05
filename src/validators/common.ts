import { param, query } from 'express-validator'


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
