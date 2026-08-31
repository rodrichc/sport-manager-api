import { PaymentRepository } from "./payment.repository";
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import { AppError } from "../../utils/appError";
import { db } from "../../config/db";
import { BookingStatus, PaymentStatus } from "@prisma/client";
import { env } from "../../config/env";

export class PaymentService {
    private client: MercadoPagoConfig;
    
    constructor(private readonly paymentRepository: PaymentRepository) {
        this.client = new MercadoPagoConfig({ 
            accessToken: env.MERCADOPAGO_ACCESS_TOKEN || "TEST-token", 
            options: { timeout: 5000 } 
        });
    }

    async createPaymentIntention(bookingId: number, courtId: number, title: string, amount: number) {
        const preference = new Preference(this.client);
        
        const frontendUrl = env.FRONTEND_URL || "http://localhost:3000";

        const prefResponse = await preference.create({
            body: {
                items: [
                    {
                        id: courtId.toString(),
                        title: title,
                        quantity: 1,
                        unit_price: amount
                    }
                ],
                back_urls: {
                    success: `${frontendUrl}/bookings/success`,
                    failure: `${frontendUrl}/bookings/failure`,
                    pending: `${frontendUrl}/bookings/pending`
                },
                auto_return: "approved",
                metadata: {
                    booking_id: bookingId
                },
                notification_url: env.WEBHOOK_URL ? `${env.WEBHOOK_URL}/payments/webhook` : undefined
            }
        });

        if (!prefResponse.id) {
            throw new AppError("Error creating MercadoPago preference", 500);
        }

        const payment = await this.paymentRepository.create(bookingId, amount);

        await this.paymentRepository.update(payment.id, {
            preferenceId: prefResponse.id
        });

        return {
            paymentId: payment.id,
            preferenceId: prefResponse.id,
            initPoint: prefResponse.init_point
        };
    }

    async processWebhook(paymentIdStr: string) {
        const paymentClient = new Payment(this.client);
        const paymentData = await paymentClient.get({ id: paymentIdStr });
        
        if (!paymentData || !paymentData.metadata || !paymentData.metadata.booking_id) {
            return;
        }

        const bookingId = Number(paymentData.metadata.booking_id);
        const status = paymentData.status;

        const payment = await this.paymentRepository.findByBookingId(bookingId);
        if (!payment) return;

        let dbStatus: PaymentStatus = PaymentStatus.PENDING;
        let bookingStatus: BookingStatus = BookingStatus.PENDING;

        if (status === 'approved') {
            dbStatus = PaymentStatus.APPROVED;
            bookingStatus = BookingStatus.CONFIRMED;
        } else if (status === 'rejected' || status === 'cancelled') {
            dbStatus = status === 'rejected' ? PaymentStatus.REJECTED : PaymentStatus.CANCELLED;
            bookingStatus = BookingStatus.CANCELLED;
        } else {
            return;
        }

        await db.$transaction([
            db.payment.update({
                where: { id: payment.id },
                data: { 
                    status: dbStatus,
                    mercadopagoPaymentId: paymentIdStr,
                    paymentMethod: paymentData.payment_method_id,
                    statusDetail: paymentData.status_detail,
                    rawResponse: paymentData as any
                }
            }),
            db.booking.update({
                where: { id: bookingId },
                data: { status: bookingStatus }
            })
        ]);
    }
}
