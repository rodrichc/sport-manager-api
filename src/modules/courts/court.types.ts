import { Court } from '@prisma/client'


export type CourtDTO = Omit<Court, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>

export type DeleteCourtDTO = Pick<Court, "deletedAt" | "isActive">

export interface CourtFilters {
    sport?: string
    isIndoor?: boolean
    
    latitude?: number
    longitude?: number
    radius?: number
}