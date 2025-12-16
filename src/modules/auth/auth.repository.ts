import { db } from "../../config/db"
import { UserId } from "../../types"
import { CreateAccountDTO, UserEmail, Username, UserPhoneNumber } from "./auth.types"


export class AuthRepository {

    async findUserForEmail(email: UserEmail) {
        return await db.user.findFirst({
            where: {
                email
            }
        })
    }

    async findUserForUsername(username: Username) {
        return await db.user.findFirst({
            where: {
                username
            }
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
}