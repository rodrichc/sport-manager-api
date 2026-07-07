/**
 * @swagger
 * components:
 *   schemas:
 *     CreateBookingDTO:
 *       type: object
 *       required:
 *         - courtId
 *         - startTime
 *         - endTime
 *       properties:
 *         courtId:
 *           type: integer
 *           description: ID de la cancha a reservar
 *           example: 3
 *         startTime:
 *           type: string
 *           format: date-time
 *           description: >
 *             Hora de inicio en formato ISO 8601 UTC (con sufijo 'Z').
 *             Ejemplo: 2026-01-05T21:00:00Z
 *           example: "2026-07-10T18:00:00Z"
 *         endTime:
 *           type: string
 *           format: date-time
 *           description: >
 *             Hora de fin en formato ISO 8601 UTC (con sufijo 'Z').
 *             Ejemplo: 2026-01-05T22:00:00Z
 *           example: "2026-07-10T19:00:00Z"
 *
 *     BookingResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la reserva
 *           example: 42
 *         userId:
 *           type: integer
 *           description: ID del usuario que realizó la reserva
 *           example: 7
 *         courtId:
 *           type: integer
 *           description: ID de la cancha reservada
 *           example: 3
 *         startTime:
 *           type: string
 *           format: date-time
 *           description: Hora de inicio de la reserva (UTC)
 *           example: "2026-07-10T18:00:00.000Z"
 *         endTime:
 *           type: string
 *           format: date-time
 *           description: Hora de fin de la reserva (UTC)
 *           example: "2026-07-10T19:00:00.000Z"
 *         totalPrice:
 *           type: number
 *           format: double
 *           description: Precio total calculado de la reserva
 *           example: 15000
 *         paymentUrl:
 *           type: string
 *           description: URL de MercadoPago para abonar la reserva (si aplica)
 *           example: "https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=..."
 *         status:
 *           type: string
 *           enum:
 *             - PENDING
 *             - CONFIRMED
 *             - CANCELLED
 *             - COMPLETED
 *           description: Estado actual de la reserva
 *           example: CONFIRMED
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación del registro
 *           example: "2026-07-10T17:55:30.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización del registro
 *           example: "2026-07-10T17:55:30.000Z"
 */

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Crear una reserva
 *     description: >
 *       Crea una nueva reserva para una cancha en el rango horario indicado.
 *       El backend valida disponibilidad, horarios del complejo, y duración
 *       permitida antes de confirmar la reserva.
 *     tags:
 *       - Bookings
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBookingDTO'
 *     responses:
 *       201:
 *         description: Reserva creada con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Reserva creada con éxito
 *                 data:
 *                   $ref: '#/components/schemas/BookingResponse'
 *       400:
 *         description: Error de validación de inputs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: field
 *                       msg:
 *                         type: string
 *                         example: La hora de inicio es obligatoria
 *                       path:
 *                         type: string
 *                         example: startTime
 *                       location:
 *                         type: string
 *                         example: body
 *       409:
 *         description: Conflicto — el turno ya se encuentra ocupado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: La cancha ya fue reservada por otro usuario dentro de ese horario
 */

/**
 * @swagger
 * /bookings/my-bookings:
 *   get:
 *     summary: Obtener historial de reservas
 *     description: >
 *       Lista todas las reservas realizadas por el usuario autenticado, ordenadas
 *       por fecha de inicio de manera descendente (las más recientes primero).
 *       Incluye información detallada de la cancha y el complejo deportivo.
 *     tags:
 *       - Bookings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historial de reservas obtenido con éxito (puede estar vacío)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/BookingResponse'
 *                       - type: object
 *                         properties:
 *                           court:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 1
 *                               name:
 *                                 type: string
 *                                 example: Cancha 1
 *                               sport:
 *                                 type: string
 *                                 example: fútbol 5
 *                               complex:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: integer
 *                                     example: 1
 *                                   name:
 *                                     type: string
 *                                     example: Complejo El Trébol
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Token ausente o inválido
 */
