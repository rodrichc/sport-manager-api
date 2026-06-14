/**
 * @swagger
 * components:
 *   schemas:
 *     ScheduleInput:
 *       type: object
 *       required:
 *         - dayOfWeek
 *         - startTime
 *         - endTime
 *       properties:
 *         dayOfWeek:
 *           type: integer
 *           minimum: 0
 *           maximum: 6
 *           description: "Día de la semana (0 = Domingo, 6 = Sábado)"
 *           example: 1
 *         startTime:
 *           type: string
 *           pattern: "^([01]?[0-9]|2[0-3]):[0-5][0-9]$"
 *           description: Hora de apertura en formato HH:MM
 *           example: "09:00"
 *         endTime:
 *           type: string
 *           pattern: "^([01]?[0-9]|2[0-3]):[0-5][0-9]$"
 *           description: Hora de cierre en formato HH:MM
 *           example: "23:00"
 *
 *     ScheduleResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         dayOfWeek:
 *           type: integer
 *           example: 1
 *         startTime:
 *           type: string
 *           example: "09:00"
 *         endTime:
 *           type: string
 *           example: "23:00"
 *         complexId:
 *           type: integer
 *           example: 5
 *
 *     CreateComplexDTO:
 *       type: object
 *       required:
 *         - name
 *         - address
 *         - schedules
 *       properties:
 *         name:
 *           type: string
 *           example: "Complejo El Gigante"
 *         address:
 *           type: string
 *           example: "Av. Colón 1234, Córdoba"
 *         schedules:
 *           type: array
 *           minItems: 1
 *           items:
 *             $ref: '#/components/schemas/ScheduleInput'
 *
 *     UpdateComplexDTO:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Complejo Renovado"
 *         description:
 *           type: string
 *           maxLength: 150
 *           example: "El mejor complejo deportivo de la zona"
 *         address:
 *           type: string
 *           example: "Av. Colón 5678, Córdoba"
 *         lat:
 *           type: number
 *           format: float
 *           minimum: -90
 *           maximum: 90
 *           example: -31.4201
 *         lng:
 *           type: number
 *           format: float
 *           minimum: -180
 *           maximum: 180
 *           example: -64.1888
 *         logo:
 *           type: string
 *           nullable: true
 *           example: "https://cdn.example.com/logo.png"
 *
 *     ComplexResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 5
 *         name:
 *           type: string
 *           example: "Complejo El Gigante"
 *         description:
 *           type: string
 *           nullable: true
 *           example: "El mejor complejo deportivo de la zona"
 *         address:
 *           type: string
 *           example: "Av. Colón 1234, Córdoba"
 *         lat:
 *           type: number
 *           nullable: true
 *           example: -31.4201
 *         lng:
 *           type: number
 *           nullable: true
 *           example: -64.1888
 *         logo:
 *           type: string
 *           nullable: true
 *           example: null
 *         status:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *           example: PENDING
 *         ownerId:
 *           type: integer
 *           example: 7
 *         minBookingDuration:
 *           type: integer
 *           example: 60
 *         maxBookingDuration:
 *           type: integer
 *           example: 180
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-06-10T14:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-06-10T14:30:00.000Z"
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: null
 *
 *     ComplexWithSchedules:
 *       allOf:
 *         - $ref: '#/components/schemas/ComplexResponse'
 *         - type: object
 *           properties:
 *             schedules:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ScheduleResponse'
 *
 *     CourtResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 3
 *         name:
 *           type: string
 *           example: "Cancha 1"
 *         sport:
 *           type: string
 *           example: "fútbol"
 *         type:
 *           type: string
 *           nullable: true
 *           example: "5v5"
 *         price:
 *           type: number
 *           format: double
 *           example: 15000.00
 *         duration:
 *           type: integer
 *           example: 60
 *         isIndoor:
 *           type: boolean
 *           example: false
 *         isActive:
 *           type: boolean
 *           example: true
 *         complexId:
 *           type: integer
 *           example: 5
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-06-10T14:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-06-10T14:30:00.000Z"
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: null
 */


/**
 * @swagger
 * /complexes:
 *   post:
 *     summary: Crear un complejo deportivo
 *     description: >
 *       Crea un nuevo complejo con sus horarios de atención.
 *       Solo usuarios con rol OWNER pueden crear complejos.
 *       El complejo se crea con status PENDING hasta ser aprobado por un ADMIN.
 *     tags: [Complexes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateComplexDTO'
 *     responses:
 *       201:
 *         description: Complejo creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Complejo creado correctamente."
 *                 newComplex:
 *                   $ref: '#/components/schemas/ComplexWithSchedules'
 *       400:
 *         description: Datos inválidos o faltantes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: No autorizado — token faltante o inválido
 *       403:
 *         description: El usuario no tiene rol OWNER
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Debe tener una cuenta de tipo Dueño para crear un Complejo"
 */

/**
 * @swagger
 * /complexes:
 *   get:
 *     summary: Listar todos los complejos activos
 *     description: >
 *       Retorna todos los complejos con status APPROVED y sin soft-delete.
 *       No requiere autenticación obligatoria (usa autenticación opcional).
 *     tags: [Complexes]
 *     responses:
 *       200:
 *         description: Lista de complejos activos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ComplexResponse'
 */

/**
 * @swagger
 * /complexes/my-complexes:
 *   get:
 *     summary: Obtener mis complejos activos
 *     description: Retorna los complejos activos (no eliminados) del usuario autenticado, incluyendo sus horarios.
 *     tags: [Complexes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de complejos activos del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ComplexWithSchedules'
 *       401:
 *         description: No autorizado — token faltante o inválido
 */

/**
 * @swagger
 * /complexes/my-deleted:
 *   get:
 *     summary: Obtener mis complejos eliminados
 *     description: Retorna los complejos con soft-delete del usuario autenticado.
 *     tags: [Complexes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de complejos eliminados del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ComplexResponse'
 *       401:
 *         description: No autorizado — token faltante o inválido
 */

/**
 * @swagger
 * /complexes/{id}:
 *   patch:
 *     summary: Actualizar un complejo
 *     description: >
 *       Actualiza parcialmente los datos de un complejo.
 *       Solo el dueño del complejo o un ADMIN pueden realizarlo.
 *     tags: [Complexes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del complejo
 *         example: 5
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateComplexDTO'
 *     responses:
 *       200:
 *         description: Complejo actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ComplexResponse'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: No autorizado — token faltante o inválido
 *       403:
 *         description: No es dueño del complejo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Acción no válida. No eres dueño de este complejo."
 *       404:
 *         description: Complejo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Complejo no encontrado"
 */

/**
 * @swagger
 * /complexes/{id}:
 *   delete:
 *     summary: Eliminar un complejo (soft delete)
 *     description: >
 *       Marca el complejo como eliminado (soft delete).
 *       Solo el dueño o un ADMIN pueden realizarlo.
 *       El complejo puede ser restaurado posteriormente.
 *     tags: [Complexes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del complejo
 *         example: 5
 *     responses:
 *       200:
 *         description: Complejo eliminado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Complejo eliminado correctamente."
 *       401:
 *         description: No autorizado — token faltante o inválido
 *       403:
 *         description: No es dueño del complejo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Acción no válida. No eres dueño de este complejo."
 *       404:
 *         description: Complejo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Complejo no encontrado"
 */

/**
 * @swagger
 * /complexes/{id}/restore:
 *   patch:
 *     summary: Restaurar un complejo eliminado
 *     description: >
 *       Restaura un complejo que fue previamente eliminado con soft delete.
 *       Solo el dueño o un ADMIN pueden realizarlo.
 *     tags: [Complexes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del complejo
 *         example: 5
 *     responses:
 *       200:
 *         description: Complejo restaurado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Complejo restaurado correctamente"
 *                 complex:
 *                   $ref: '#/components/schemas/ComplexResponse'
 *       400:
 *         description: El complejo no está eliminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "El complejo no está eliminado"
 *       401:
 *         description: No autorizado — token faltante o inválido
 *       403:
 *         description: No es dueño del complejo
 *       404:
 *         description: Complejo no encontrado
 */

/**
 * @swagger
 * /complexes/{id}/status:
 *   patch:
 *     summary: Actualizar el estado de un complejo (Solo ADMIN)
 *     description: >
 *       Permite a un administrador aprobar o rechazar un complejo.
 *       Solo usuarios con rol ADMIN pueden usar este endpoint.
 *     tags: [Complexes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del complejo
 *         example: 5
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [APPROVED, REJECTED]
 *                 example: "APPROVED"
 *     responses:
 *       200:
 *         description: Estado actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Estado actualizado correctamente."
 *                 complex:
 *                   $ref: '#/components/schemas/ComplexResponse'
 *       400:
 *         description: Status inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: No autorizado — token faltante o inválido
 *       403:
 *         description: Solo administradores pueden cambiar el estado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Acción no autorizada. Solo Administradores"
 */

/**
 * @swagger
 * /complexes/{id}/schedules:
 *   patch:
 *     summary: Actualizar horarios de un complejo
 *     description: >
 *       Reemplaza todos los horarios del complejo.
 *       Elimina los horarios anteriores y crea los nuevos en una transacción.
 *       Solo el dueño o un ADMIN pueden realizarlo.
 *     tags: [Complexes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del complejo
 *         example: 5
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [schedules]
 *             properties:
 *               schedules:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   $ref: '#/components/schemas/ScheduleInput'
 *     responses:
 *       200:
 *         description: Horarios actualizados correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Horarios actualizados correctamente."
 *                 complex:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ScheduleResponse'
 *       400:
 *         description: Datos de horarios inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: No autorizado — token faltante o inválido
 *       403:
 *         description: No es dueño del complejo
 *       404:
 *         description: Complejo no encontrado
 */

/**
 * @swagger
 * /complexes/{id}/courts:
 *   get:
 *     summary: Obtener canchas de un complejo
 *     description: >
 *       Retorna todas las canchas activas (isActive=true, sin soft-delete)
 *       de un complejo específico. No requiere autenticación.
 *     tags: [Complexes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del complejo
 *         example: 5
 *     responses:
 *       200:
 *         description: Lista de canchas del complejo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CourtResponse'
 */