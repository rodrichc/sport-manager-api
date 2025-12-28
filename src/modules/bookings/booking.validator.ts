import { body, query } from 'express-validator'
import { handleInputErrors } from '../../middleware/validation' 

export const validateCreateBooking = [
    body('courtId')
        .notEmpty().withMessage('El ID de la cancha es obligatorio')
        .isInt().withMessage('El ID de la cancha debe ser un número entero'),

    body('startTime')
        .notEmpty().withMessage('La hora de inicio es obligatoria')
        .isISO8601().withMessage('La fecha de inicio debe tener formato ISO 8601 (ej: 2023-12-28T18:00:00Z)')
        .toDate(),

    body('endTime')
        .notEmpty().withMessage('La hora de fin es obligatoria')
        .isISO8601().withMessage('La fecha de fin debe tener formato ISO 8601')
        .toDate(),

    handleInputErrors
]

export const validateGetAvailability = [
    query('courtId')
        .notEmpty().withMessage('El ID de la cancha es obligatorio')
        .isInt().withMessage('El ID de la cancha debe ser un número entero')
        .toInt(), 

    query('date')
        .notEmpty().withMessage('La fecha es obligatoria')
        .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Formato inválido. Usá YYYY-MM-DD (Ej: 2025-12-28)'),

    handleInputErrors
]
