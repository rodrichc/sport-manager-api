import { db } from "../../config/db";
import { ComplexId, UserId } from "../../types";
import { CreateReviewDTO, UpdateReviewDTO } from "./review.types";

export class ReviewRepository {
    async findComplexOwner(complexId: ComplexId) {
        const complex = await db.complex.findUnique({
            where: { id: complexId },
            select: { ownerId: true }
        });
        return complex ? complex.ownerId : null;
    }

    async hasCompletedBooking(userId: UserId, complexId: ComplexId): Promise<boolean> {
        const booking = await db.booking.findFirst({
            where: {
                userId,
                status: 'COMPLETED',
                court: {
                    complexId
                }
            },
            select: { id: true }
        });
        return !!booking;
    }

    async findUserReview(userId: UserId, complexId: ComplexId) {
        return await db.review.findUnique({
            where: {
                userId_complexId: {
                    userId,
                    complexId
                }
            }
        });
    }

    async create(userId: UserId, complexId: ComplexId, data: CreateReviewDTO) {
        return await db.review.create({
            data: {
                userId,
                complexId,
                rating: data.rating,
                comment: data.comment
            }
        });
    }

    async update(userId: UserId, complexId: ComplexId, data: UpdateReviewDTO) {
        return await db.review.update({
            where: {
                userId_complexId: {
                    userId,
                    complexId
                }
            },
            data
        });
    }

    async delete(userId: UserId, complexId: ComplexId) {
        return await db.review.delete({
            where: {
                userId_complexId: {
                    userId,
                    complexId
                }
            }
        });
    }

    async findByComplexId(complexId: ComplexId) {
        const [reviews, stats] = await Promise.all([
            db.review.findMany({
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
            }),
            db.review.aggregate({
                where: { complexId },
                _avg: { rating: true },
                _count: { rating: true }
            })
        ]);

        return {
            reviews,
            average: stats._avg.rating ? Number(stats._avg.rating.toFixed(1)) : 0,
            total: stats._count.rating
        };
    }
}