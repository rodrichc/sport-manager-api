import { db } from "../../config/db"
import { UserId } from "../../types"

export class UsersRepository {
    async findById(id: UserId) {
        return await db.user.findUnique({ where: { id } })
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
