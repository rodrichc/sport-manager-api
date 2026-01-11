import { body, query } from 'express-validator'
import { handleInputErrors } from '../../middleware/validation' 

const ISO_UTC_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?Z$/

/**
 * TIMEZONE CONTRACT — Create Booking
 *
 * - `startTime` and `endTime` must be ISO 8601 datetimes in UTC (with 'Z').
 *   Example: 2026-01-05T21:00:00Z
 *
 * - These fields represent an absolute instant in time, not a local wall-clock time.
 *
 * - The complex timezone is only used internally to validate schedules and availability.
 */

export const validateCreateBooking = [
  body('courtId')
    .notEmpty().withMessage('El ID de la cancha es obligatorio')
    .isInt().withMessage('El ID de la cancha debe ser un número entero'),

  body('startTime')
    .notEmpty().withMessage('La hora de inicio es obligatoria')
    .matches(ISO_UTC_REGEX)
    .withMessage('Debe ser ISO 8601 en UTC (ej: 2026-01-05T21:00:00Z)'),

  body('endTime')
    .notEmpty().withMessage('La hora de fin es obligatoria')
    .matches(ISO_UTC_REGEX)
    .withMessage('Debe ser ISO 8601 en UTC (ej: 2026-01-05T22:00:00Z)'),

  handleInputErrors
]


/**
 * TIMEZONE CONTRACT — Availability endpoint
 *
 * - The `date` query parameter represents a calendar date in the complex's local timezone.
 *   It is NOT UTC and NOT the user's local timezone.
 *
 *   Example:
 *     date=2026-01-05   -> means "January 5th in the complex's local time"
 *
 * - The server will interpret this date as local to the complex timezone
 *   when calculating availability slots.
 */

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
