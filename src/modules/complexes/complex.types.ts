import { Complex } from "@prisma/client"


export type CreateComplexDTO = Pick<Complex, "name" | "address" | "openTime" | "closeTime" | "ownerId">


export type UpdateComplexDTO = Partial<Omit<Complex, "id" | "ownerId" | "createdAt" | "updatedAt" | "deletedAt">>

export type DeleteComplexDTO = Pick<Complex, "deletedAt">

export type ComplexStatus = Complex['status']
