import { Complex } from "@prisma/client"


export type CreateComplexDTO = Pick<Complex, "name" | "address" | "openTime" | "closeTime" | "ownerId">

export type findComplexesCondition = {
    status: string,
    deletedAt: Complex["deletedAt"]
}

export type idComplex = Complex["id"]

export type UpdateComplexDTO = Omit<Complex, "id" | "ownerId" | "status" | "createdAt" | "updatedAt" | "deletedAt">

export type DeleteComplexDTO = Pick<Complex, "deletedAt">