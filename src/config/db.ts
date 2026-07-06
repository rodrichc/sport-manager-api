import { PrismaClient, Prisma } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db = (globalForPrisma.prisma || new PrismaClient()).$extends({
    query: {
        $allModels: {
            async $allOperations({ model, operation, args, query }) {
                if (['findMany', 'findFirst', 'findUnique'].includes(operation)) {
                    const hasDeletedAt = Prisma.dmmf.datamodel.models
                        .find((m) => m.name === model)
                        ?.fields.some((f) => f.name === 'deletedAt');

                    if (hasDeletedAt) {
                        args = args || {};
                        args.where = args.where || {};
                        if (args.where.deletedAt === undefined) {
                            args.where.deletedAt = null;
                        }
                    }
                }
                return query(args);
            }
        }
    }
}) as unknown as PrismaClient;

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = db;
}
