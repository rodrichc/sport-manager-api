/**
 * @swagger
 * components:
 *   schemas:
 *     CreateCourtDTO:
 *       type: object
 *       required:
 *         - name
 *         - sport
 *         - complexId
 *         - price
 *       properties:
 *         name:
 *           type: string
 *           description: Nombre de la cancha
 *           example: "Cancha 1"
 *         sport:
 *           type: string
 *           description: Deporte principal de la cancha
 *           example: "fútbol"
 *         type:
 *           type: string
 *           nullable: true
 *           description: Tipo o modalidad (ej. 5v5, 7v7)
 *           example: "5v5"
 *         complexId:
 *           type: integer
 *           description: ID del complejo al que pertenece
 *           example: 5
 *         price:
 *           type: number
 *           format: double
 *           minimum: 0
 *           description: Precio por hora
 *           example: 15000
 *         duration:
 *           type: integer
 *           description: Duración por defecto del turno en minutos
 *           default: 60
 *           example: 60
 *         isIndoor:
 *           type: boolean
 *           description: Si la cancha es techada
 *           default: false
 *           example: false
 *         isActive:
 *           type: boolean
 *           description: Si la cancha está activa para recibir reservas
 *           default: true
 *           example: true
 */


/**
 * @swagger
 * /courts:
 *   post:
 *     summary: Crear una cancha
 *     description: >
 *       Crea una nueva cancha dentro de un complejo.
 *       El usuario autenticado debe ser el dueño del complejo indicado en complexId.
 *     tags: [Courts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCourtDTO'
 *     responses:
 *       201:
 *         description: Cancha creada con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cancha creada con éxito"
 *                 data:
 *                   $ref: '#/components/schemas/CourtResponse'
 *       400:
 *         description: Datos inválidos o faltantes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: No autorizado — token faltante o inválido
 *       403:
 *         description: No es dueño del complejo indicado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No tenés permiso sobre este complejo"
 */

/**
 * @swagger
 * /courts:
 *   get:
 *     summary: Listar todas las canchas activas
 *     description: >
 *       Retorna todas las canchas activas (isActive=true) y no eliminadas.
 *       No requiere autenticación.
 *     tags: [Courts]
 *     responses:
 *       200:
 *         description: Lista de canchas activas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CourtResponse'
 *       404:
 *         description: No se encontraron canchas activas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No se encontraron canchas activas"
 */

/**
 * @swagger
 * /courts/my-courts:
 *   get:
 *     summary: Obtener mis canchas activas
 *     description: >
 *       Retorna las canchas activas (no eliminadas) de los complejos
 *       del usuario autenticado. Incluye datos del complejo asociado.
 *     tags: [Courts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de canchas del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/CourtResponse'
 *                       - type: object
 *                         properties:
 *                           complex:
 *                             $ref: '#/components/schemas/ComplexResponse'
 *       401:
 *         description: No autorizado — token faltante o inválido
 *       404:
 *         description: No se encontraron canchas activas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No se encontraron canchas activas"
 */

/**
 * @swagger
 * /courts/my-deleted:
 *   get:
 *     summary: Obtener mis canchas eliminadas
 *     description: >
 *       Retorna las canchas con soft-delete de los complejos
 *       del usuario autenticado. Incluye datos del complejo asociado.
 *     tags: [Courts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de canchas eliminadas del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/CourtResponse'
 *                       - type: object
 *                         properties:
 *                           complex:
 *                             $ref: '#/components/schemas/ComplexResponse'
 *       401:
 *         description: No autorizado — token faltante o inválido
 *       404:
 *         description: No se encontraron canchas en papelera
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No se encontraron canchas en papelera"
 */

/**
 * @swagger
 * /courts/{id}:
 *   get:
 *     summary: Obtener una cancha por ID
 *     description: >
 *       Retorna los datos de una cancha activa (isActive=true),
 *       incluyendo el complejo asociado. No requiere autenticación.
 *     tags: [Courts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cancha
 *         example: 3
 *     responses:
 *       200:
 *         description: Cancha encontrada
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/CourtResponse'
 *                 - type: object
 *                   properties:
 *                     complex:
 *                       $ref: '#/components/schemas/ComplexResponse'
 *       404:
 *         description: No existe una cancha con este ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No existe un cancha con este ID"
 */

/**
 * @swagger
 * /courts/{id}:
 *   patch:
 *     summary: Actualizar una cancha
 *     description: >
 *       Actualiza los datos de una cancha existente.
 *       El usuario autenticado debe ser dueño del complejo al que pertenece la cancha.
 *     tags: [Courts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cancha
 *         example: 3
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCourtDTO'
 *     responses:
 *       200:
 *         description: Cancha actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourtResponse'
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
 *                   example: "No tenés permiso sobre este complejo"
 *       404:
 *         description: Cancha no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cancha inexistente."
 */

/**
 * @swagger
 * /courts/{id}:
 *   delete:
 *     summary: Eliminar una cancha (soft delete)
 *     description: >
 *       Marca la cancha como eliminada (soft delete) y la desactiva (isActive=false).
 *       El usuario autenticado debe ser dueño del complejo.
 *       La cancha puede ser restaurada posteriormente.
 *     tags: [Courts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cancha
 *         example: 3
 *     responses:
 *       200:
 *         description: Cancha eliminada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cancha eliminada correctamente."
 *       401:
 *         description: No autorizado — token faltante o inválido
 *       403:
 *         description: No es dueño del complejo
 *       404:
 *         description: Cancha no encontrada
 */

/**
 * @swagger
 * /courts/{id}/restore:
 *   patch:
 *     summary: Restaurar una cancha eliminada
 *     description: >
 *       Restaura una cancha que fue eliminada con soft delete.
 *       La cancha queda con isActive=false — debe activarse manualmente después.
 *       El usuario autenticado debe ser dueño del complejo.
 *     tags: [Courts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cancha
 *         example: 3
 *     responses:
 *       200:
 *         description: Cancha restaurada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cancha restaurada correctamente"
 *                 court:
 *                   $ref: '#/components/schemas/CourtResponse'
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
 *                   example: "No tenés permiso sobre este complejo"
 *       404:
 *         description: No se encontró la cancha en la papelera
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No se encontró la cancha en la papelera"
 */

/**
 * @swagger
 * /courts/{id}/force:
 *   delete:
 *     summary: Eliminar una cancha permanentemente
 *     description: >
 *       Elimina definitivamente una cancha de la base de datos.
 *       Solo se puede ejecutar sobre canchas que ya están en la papelera (soft-deleted).
 *       El usuario autenticado debe ser dueño del complejo.
 *     tags: [Courts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cancha
 *         example: 3
 *     responses:
 *       200:
 *         description: Cancha eliminada permanentemente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cancha eliminada correctamente"
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
 *                   example: "No tenés permiso sobre este complejo"
 *       404:
 *         description: No se encontró la cancha en la papelera
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No se encontró la cancha en la papelera"
 */
