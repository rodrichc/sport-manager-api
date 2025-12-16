import { Complex } from "@prisma/client"


export type CreateComplexDTO = Pick<Complex, "name" | "address" | "openTime" | "closeTime" | "ownerId">

export type FindComplexesCondition = {
    status: string,
    deletedAt: Complex["deletedAt"]
}

export type UpdateComplexDTO = Partial<Omit<Complex, "id" | "ownerId" | "status" | "createdAt" | "updatedAt" | "deletedAt">>

export type DeleteComplexDTO = Pick<Complex, "deletedAt">