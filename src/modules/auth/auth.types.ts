import { User } from "@prisma/client"

export type userEmail = User['email']

export type username = User['username']

export type userPhoneNumber = User['phoneNumber']

export type CreateAccountDTO = Pick<User, 'name' | 'email' | 'password' | 'username' | 'role' | 'phoneNumber'>

export type LoginDTO = Pick<User, 'email' | 'password'>
