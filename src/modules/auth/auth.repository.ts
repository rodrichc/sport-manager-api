import { db } from "../../config/db"
import { userId } from "../../types"
import { CreateAccountDTO, userEmail, username, userPhoneNumber } from "./auth.types"


export class AuthRepository {

    async findUserForEmail(email: userEmail) {
        return await db.user.findFirst({
            where: {
                email
            }
        })
    }

    async findUserForUsername(username: username) {
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

    async updateToOwner(id: userId, phoneNumber: userPhoneNumber) {
        return await db.user.update({
            where: { id },
            data: { 
                role: 'OWNER',
                phoneNumber
             }
        })
    }
}