import { Complex, Court, User } from '@prisma/client'


export type CreateCourtDTO = Omit<Court, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>

export type userId = User['id']

export type complexId = Complex['id']
