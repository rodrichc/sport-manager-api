import { param } from 'express-validator'


export const validateId = param('id')
    .isInt().withMessage('El ID debe ser válido')
