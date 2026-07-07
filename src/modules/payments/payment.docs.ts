/**
 * @swagger
 * /payments/webhook:
 *   post:
 *     summary: Webhook de MercadoPago
 *     description: >
 *       Recibe notificaciones asíncronas de MercadoPago sobre el estado de un pago.
 *       Actualiza el estado de la reserva correspondiente a "CONFIRMED" si el pago fue aprobado,
 *       o la cancela/rechaza si el pago falló.
 *     tags:
 *       - Payments
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Tipo de notificación (e.g., payment)
 *       - in: query
 *         name: data.id
 *         schema:
 *           type: string
 *         description: ID del pago en MercadoPago
 *     responses:
 *       200:
 *         description: Webhook procesado exitosamente
 *       400:
 *         description: Parámetros inválidos o faltantes
 *       500:
 *         description: Error interno al procesar el webhook
 */
