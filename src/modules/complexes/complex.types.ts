import { Complex } from "@prisma/client"


export type ScheduleInput = {
    dayOfWeek: number
    startTime: string
    endTime: string
}

export type CreateComplexDTO = Pick<Complex, "name" | "address" > & { schedules: ScheduleInput [] }

export type UpdateComplexDTO = Partial<Omit<Complex, "id" | "ownerId" | "createdAt" | "updatedAt" | "deletedAt">>

export type DeleteComplexDTO = Pick<Complex, "deletedAt">

export type ComplexStatus = Complex['status']
