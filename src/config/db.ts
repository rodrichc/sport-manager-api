import { PrismaClient, Prisma } from '@prisma/client';
import { env } from './env';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db = (globalForPrisma.prisma || new PrismaClient()).$extends({
    query: {
        $allModels: {
            async $allOperations({ model, operation, args, query }) {
                if (['findMany', 'findFirst'].includes(operation)) {
                    const hasDeletedAt = Prisma.dmmf.datamodel.models
                        .find((m) => m.name === model)
                        ?.fields.some((f) => f.name === 'deletedAt');

                    if (hasDeletedAt) {
                        args = args || {} as any;
                        (args as any).where = (args as any).where || {};
                        if ((args as any).where.deletedAt === undefined) {
                            (args as any).where.deletedAt = null;
                        }
                    }
                }
                return query(args);
            }
        }
    }
}) as unknown as PrismaClient;

if (env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = db;
}
