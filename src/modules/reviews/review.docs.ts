/**
 * @swagger
 * components:
 *   schemas:
 *     CreateReviewDTO:
 *       type: object
 *       required:
 *         - rating
 *       properties:
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           example: 5
 *         comment:
 *           type: string
 *           example: "Excelente complejo, muy buenas canchas."
 *
 *     ReviewResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         rating:
 *           type: integer
 *           example: 5
 *         comment:
 *           type: string
 *           nullable: true
 *           example: "Excelente complejo, muy buenas canchas."
 *         userId:
 *           type: integer
 *           example: 1
 *         complexId:
 *           type: integer
 *           example: 1
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-07-06T14:30:00.000Z"
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             name:
 *               type: string
 *               example: "Juan Perez"
 *             avatar:
 *               type: string
 *               nullable: true
 *               example: "https://example.com/avatar.jpg"
 */

/**
 * @swagger
 * /complexes/{id}/reviews:
 *   post:
 *     summary: Crear una reseña para un complejo
 *     description: >
 *       Crea una reseña para un complejo.
 *       El usuario debe tener al menos una reserva con estado COMPLETED en este complejo.
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del complejo
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReviewDTO'
 *     responses:
 *       201:
 *         description: Reseña creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Reseña creada exitosamente."
 *                 review:
 *                   $ref: '#/components/schemas/ReviewResponse'
 *       400:
 *         description: Datos inválidos o faltantes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: No autorizado — token faltante o inválido
 *       403:
 *         description: El usuario no tiene reservas completadas en el complejo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Debes tener al menos una reserva completada en este complejo para poder opinar."
 * 
 *   get:
 *     summary: Obtener reseñas de un complejo
 *     description: >
 *       Retorna todas las reseñas de un complejo, ordenadas por fecha de creación (más recientes primero).
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del complejo
 *         example: 1
 *     responses:
 *       200:
 *         description: Lista de reseñas del complejo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ReviewResponse'
 */
