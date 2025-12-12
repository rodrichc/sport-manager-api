import { User } from '@prisma/client'


export type UserSafe = Pick<User, 'id' | 'name' | 'email' | 'username' | 'role'>

export type userId = User['id']
