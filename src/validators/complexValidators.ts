import { body } from 'express-validator'
import { handleInputErrors } from '../middleware/validation' 
import { validateId } from './common'


export const validateCreateComplex = [
    body('name')
        .notEmpty()
        .withMessage('El Nombre es obligatorio'),
    body('address')
        .notEmpty()
        .withMessage('La dirección es obligatoria'),
    body('openTime')
        .notEmpty()
        .withMessage('Hora de apertura obligatoria')
        .matches(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Formato inválido (HH:MM)'),
    body('closeTime')
        .notEmpty()
        .withMessage('Hora de cierre obligatoria')
        .matches(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Formato inválido (HH:MM)'),
    
    handleInputErrors 
]


export const validateUpdateComplex = [
    validateId,
    body('name')
        .optional()
        .notEmpty()
        .withMessage('El Nombre es obligatorio'),

    body('description')
        .optional()
        .isLength({max: 150}),


    body('address')
        .optional()
        .notEmpty()
        .withMessage('La dirección es obligatoria'),

    body('lat')
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage('La latitud debe ser un número entre -90 y 90')
        .toFloat(),
        
    body('lng') 
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage('La longitud debe ser un número entre -180 y 180')
        .toFloat(),

    body('logo')
        .optional(),

    body('openTime')
        .optional()
        .notEmpty()
        .withMessage('Hora de apertura obligatoria')
        .matches(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Formato inválido (HH:MM)'),
        
    body('closeTime')
        .optional()
        .notEmpty().withMessage('Hora de cierre obligatoria')
        .matches(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Formato inválido (HH:MM)'),
    
    handleInputErrors 
]

export const validateRestoreComplex = [
    validateId,
]

export const validateUpdateComplexStatus = [
    validateId,
    body('status')
        .isIn(['APPROVED', 'REJECTED']),

    handleInputErrors,
]