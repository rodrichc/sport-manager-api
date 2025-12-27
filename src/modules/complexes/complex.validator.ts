import { body } from 'express-validator'
import { handleInputErrors } from '../../middleware/validation' 
import { validateId } from '../../validators/common'


const timeFormat = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/

const validateShedules = [
    body('schedules')
        .exists().withMessage('Debes definir los horarios')
        .isArray({ min: 1 }).withMessage('Debes enviar al menos un horario de atención'),
    body('schedules.*.dayOfWeek')
        .isInt({ min: 0, max: 6 }).withMessage('Día inválido. Debe ser entre 0 (Dom) y 6 (Sab)'),
    body('schedules.*.startTime')
        .matches(timeFormat).withMessage('Hora de inicio inválida. Formato requerido: HH:MM')
        .notEmpty().withMessage('La hora de inicio es obligatoria'),
    body('schedules.*.endTime')
        .matches(timeFormat).withMessage('Hora de fin inválida. Formato requerido: HH:MM')
        .notEmpty().withMessage('La hora de fin es obligatoria'),
]

export const validateCreateComplex = [
    body('name')
        .notEmpty()
        .withMessage('El Nombre es obligatorio'),
    body('address')
        .notEmpty()
        .withMessage('La dirección es obligatoria'),

    ...validateShedules,
    
    handleInputErrors 
]


export const validateUpdateSchedules = [
    ...validateShedules,
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