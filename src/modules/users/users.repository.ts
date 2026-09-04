import { db } from "../../config/db"
import { UserId } from "../../types"

export class UsersRepository {
    async getPasswordById(id: UserId) {
        return await db.user.findUnique({ 
            where: { id },
            select: { password: true }
        })
    }

    async findAvatarById(id: UserId) {
        return await db.user.findUnique({ 
            where: { id },
            select: { avatar: true },
        })
    }

    async updateProfile(id: UserId, data: any) {
        return await db.user.update({
            where: { id },
            data,
            select: { id: true, name: true, email: true, username: true, role: true, phoneNumber: true, avatar: true }
        })
    }

    async updatePassword(id: UserId, password: string) {
        return await db.user.update({
            where: { id },
            data: { password }
        })
    }
}
