import { body } from 'express-validator'
import { handleInputErrors } from '../../middleware/validation'


export const validateCreateCourt = [
    body('name')
        .notEmpty().withMessage('El Nombre es obligatorio'),

    body('sport')
        .notEmpty().withMessage('El deporte es obligatorio'),

    body('complexId')
        .notEmpty().withMessage('El ID del complejo es obligatorio')
        .isInt().withMessage('El complexId debe ser un número entero'),

    body('price')
        .notEmpty().withMessage('El precio es obligatorio')
        .isFloat({min: 0}).withMessage('El precio debe ser un número válido'),

    body('duration')
        .optional()
        .isInt().withMessage('La duración debe ser en minutos (número entero)'),

        
    handleInputErrors 
]
