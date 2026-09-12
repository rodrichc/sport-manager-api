import { MercadoPagoConfig, Preference, Payment, MerchantOrder } from "mercadopago";
import { BookingStatus, PaymentStatus } from "@prisma/client";
import { PaymentRepository } from "./payment.repository";
import { AppError } from "../../utils/appError";
import { env } from "../../config/env";
import { db } from "../../config/db"; // Si tenés bookingRepository, usalo acá

export class PaymentService {
    private client: MercadoPagoConfig;

    constructor(private readonly paymentRepository: PaymentRepository) {
        if (!env.MERCADOPAGO_ACCESS_TOKEN) {
            throw new Error("MERCADOPAGO_ACCESS_TOKEN no configurado");
        }

        this.client = new MercadoPagoConfig({
            accessToken: env.MERCADOPAGO_ACCESS_TOKEN,
            options: { timeout: 5000 }
        });
    }

    async createPaymentIntention(bookingId: number, userId: number) {
        const booking = await db.booking.findUnique({
            where: { id: bookingId },
            include: { court: true }
        });

        if (!booking) {
            throw new AppError("La reserva no existe", 404);
        }
        if (booking.userId !== userId) {
            console.log(`Booking ID USER: ${booking.userId} y userId: ${userId}`)
            console.error(`[AUTH MISMATCH] Booking userId: ${booking.userId} (${typeof booking.userId}) vs Provided userId: ${userId} (${typeof userId})`);
            throw new AppError("No tienes permiso para pagar esta reserva", 403);
        }
        if (booking.status !== BookingStatus.PENDING) {
            throw new AppError(`No se puede pagar una reserva con estado ${booking.status}`, 400);
        }

        let payment = await this.paymentRepository.findByBookingId(bookingId);
        const amount = Number(booking.totalPrice ?? booking.court.price);

        const preference = new Preference(this.client);
        const frontendUrl = env.FRONTEND_URL || "http://localhost:4200";
        const webhookBaseUrl = env.WEBHOOK_URL;

        const prefResponse = await preference.create({
            body: {
                items: [
                    {
                        id: booking.courtId.toString(),
                        title: `Reserva Cancha - ${booking.court.name}`,
                        quantity: 1,
                        unit_price: amount
                    }
                ],
                back_urls: {
                    success: `${frontendUrl}/bookings/${bookingId}/success`,
                    failure: `${frontendUrl}/bookings/${bookingId}/failure`,
                    pending: `${frontendUrl}/bookings/${bookingId}/pending`
                },
                // auto_return: "approved",
                external_reference: bookingId.toString(),
                metadata: {
                    booking_id: bookingId
                },
                notification_url: webhookBaseUrl
            }
        });

        if (!prefResponse.id) {
            throw new AppError("Error al generar la preferencia de Mercado Pago", 500);
        }

        // 4. Guardar o actualizar el registro de pago
        if (!payment) {
            payment = await this.paymentRepository.create(bookingId, amount, prefResponse.id);
        } else {
            payment = await this.paymentRepository.update(payment.id, {
                preferenceId: prefResponse.id,
                amount
            });
        }

        return {
            paymentId: payment.id,
            preferenceId: prefResponse.id,
            initPoint: prefResponse.init_point
        };
    }

    async processWebhook(paymentIdStr: string) {
        const paymentClient = new Payment(this.client);
        const paymentData = await paymentClient.get({ id: paymentIdStr });

        if (!paymentData || !paymentData.external_reference) {
            return;
        }

        const bookingId = Number(paymentData.external_reference);
        const status = paymentData.status;

        const payment = await this.paymentRepository.findByBookingId(bookingId);
        if (!payment) return;

        if (payment.status === PaymentStatus.APPROVED) {
            console.log(`ℹ️ [Idempotencia] La reserva ${bookingId} ya estaba confirmada y el pago aprobado. Omitiendo duplicado.`);
            return;
        }

        let dbStatus: PaymentStatus = PaymentStatus.PENDING;
        let bookingStatus: BookingStatus = BookingStatus.PENDING;

        if (status === "approved") {
            dbStatus = PaymentStatus.APPROVED;
            bookingStatus = BookingStatus.CONFIRMED;
        } else if (status === "rejected" || status === "cancelled") {
            dbStatus = status === "rejected" ? PaymentStatus.REJECTED : PaymentStatus.CANCELLED;
            bookingStatus = BookingStatus.CANCELLED;
        } else {
            return;
        }

        await this.paymentRepository.approvePaymentAndConfirmBooking(
            payment.id,
            bookingId,
            paymentIdStr,
            paymentData.payment_method_id
        );
    }

    async processMerchantOrder(merchantOrderId: string) {
    const merchantOrderClient = new MerchantOrder(this.client);
    const order = await merchantOrderClient.get({ merchantOrderId });

    if (!order || !order.payments || order.payments.length === 0) {
        console.log(`[MerchantOrder ${merchantOrderId}] Todavía no tiene pagos asociados.`);
        return;
    }

    const approvedPayment = order.payments.find(p => p.status === "approved");

    if (approvedPayment && approvedPayment.id) {
        console.log(`🎯 Pago aprobado encontrado en la orden: ${approvedPayment.id}`);
        await this.processWebhook(String(approvedPayment.id));
    } else {
        console.log(`[MerchantOrder ${merchantOrderId}] Pagos presentes pero ninguno aprobado aún.`);
    }
}
}