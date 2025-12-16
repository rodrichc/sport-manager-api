import { Court } from '@prisma/client'


export type CreateCourtDTO = Omit<Court, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>

export interface CourtFilters {
    sport?: string
    isIndoor?: boolean
    
    latitude?: number
    longitude?: number
    radius?: number
}