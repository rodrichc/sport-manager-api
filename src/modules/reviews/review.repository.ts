import { db } from "../../config/db";
import { CreateReviewDTO } from "./review.types";

export class ReviewRepository {
    async hasCompletedBooking(userId: number, complexId: number): Promise<boolean> {
        const booking = await db.booking.findFirst({
            where: {
                userId,
                status: 'COMPLETED',
                court: {
                    complexId
                }
            }
        });
        return !!booking;
    }

    async create(userId: number, complexId: number, data: CreateReviewDTO) {
        return await db.review.create({
            data: {
                userId,
                complexId,
                rating: data.rating,
                comment: data.comment
            }
        });
    }

    async findByComplexId(complexId: number) {
        return await db.review.findMany({
            where: { complexId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
}
