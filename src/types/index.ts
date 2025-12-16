import { Complex, User } from '@prisma/client'


export type UserSafe = Pick<User, 'id' | 'name' | 'email' | 'username' | 'role'>

export type UserId = User['id']

export type ComplexId = Complex["id"]
