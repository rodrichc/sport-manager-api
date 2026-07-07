import { db } from "../../config/db";
import { PaymentStatus } from "@prisma/client";

export class PaymentRepository {
    async create(bookingId: number, amount: number) {
        return await db.payment.create({
            data: {
                bookingId,
                amount,
                status: PaymentStatus.PENDING
            }
        });
    }

    async update(id: number, data: any) {
        return await db.payment.update({
            where: { id },
            data
        });
    }

    async findByBookingId(bookingId: number) {
        return await db.payment.findFirst({
            where: { bookingId },
            orderBy: { createdAt: 'desc' }
        });
    }
}
