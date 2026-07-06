import { db } from "../../config/db"
import { UserId } from "../../types"
import { CreateAccountDTO, UserEmail, Username, UserPhoneNumber } from "./auth.types"
import { TokenType } from "@prisma/client"

export class AuthRepository {

    async findUserForEmail(email: UserEmail) {
        return await db.user.findFirst({
            where: { email }
        })
    }

    async findUserForUsername(username: Username) {
        return await db.user.findFirst({
            where: { username }
        })
    }

    async createUser(data: CreateAccountDTO) {
        return await db.user.create({
            data
        })
    }

    async updateToOwner(id: UserId, phoneNumber: UserPhoneNumber) {
        return await db.user.update({
            where: { id },
            data: { 
                role: 'OWNER',
                phoneNumber
             }
        })
    }

    async findById(id: number) {
        return await db.user.findUnique({ where: { id } })
    }

    async updateUser(id: number, data: any) {
        return await db.user.update({ where: { id }, data })
    }

    async createToken(userId: number, token: string, type: TokenType, expiresAt: Date) {
        return await db.token.create({ data: { userId, token, type, expiresAt } })
    }

    async findToken(token: string, type: TokenType) {
        return await db.token.findFirst({ where: { token, type }, include: { user: true } })
    }

    async deleteToken(id: number) {
        return await db.token.delete({ where: { id } })
    }

    async deleteTokensByUser(userId: number, type: TokenType) {
        return await db.token.deleteMany({ where: { userId, type } })
    }
}