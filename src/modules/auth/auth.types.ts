import { User } from "@prisma/client"


export type UserEmail = User['email']

export type Username = User['username']

export type UserPhoneNumber = User['phoneNumber']

export type CreateAccountDTO = Pick<User, 'name' | 'email' | 'password' | 'username' | 'role' | 'phoneNumber'>

export type LoginDTO = Pick<User, 'email' | 'password'>
