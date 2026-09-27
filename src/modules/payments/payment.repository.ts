import { db } from "../../config/db";
import { PaymentStatus, Prisma, BookingStatus } from "@prisma/client";

export class PaymentRepository {
    async create(bookingId: number, amount: number, preferenceId?: string) {
        return await db.payment.create({
            data: {
                bookingId,
                amount,
                preferenceId,
                status: PaymentStatus.PENDING
            }
        });
    }

    async update(id: number, data: Prisma.PaymentUpdateInput) {
        return await db.payment.update({
            where: { id },
            data
        });
    }

    async findByBookingId(bookingId: number) {
        return await db.payment.findFirst({
            where: { bookingId },
            orderBy: { createdAt: "desc" }
        });
    }

    async findByPreferenceId(preferenceId: string) {
        return await db.payment.findFirst({
            where: { preferenceId }
        });
    }

    async findByMpPaymentId(mercadopagoPaymentId: string) {
        return await db.payment.findFirst({
            where: { mercadopagoPaymentId }
        });
    }

    async updatePaymentAndBookingStatus(
        paymentId: number,
        bookingId: number,
        paymentStatus: PaymentStatus,
        bookingStatus: BookingStatus,
        mercadopagoPaymentId: string,
        paymentMethod?: string
    ) {
        return await db.$transaction([
            db.payment.update({
                where: { id: paymentId },
                data: {
                    status: paymentStatus,
                    mercadopagoPaymentId,
                    paymentMethod
                }
            }),
            db.booking.update({
                where: { id: bookingId },
                data: {
                    status: bookingStatus
                }
            })
        ]);
    }
}