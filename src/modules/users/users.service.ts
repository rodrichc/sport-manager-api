import { UsersRepository } from "./users.repository"
import { AppError } from "../../utils/appError"
import { checkPassword, hashPassword } from "../../utils/auth"
import { UserId } from "../../types"

export class UsersService {
    constructor(private readonly usersRepository: UsersRepository) {}

    async updateProfile(userId: UserId, data: any) {
        return await this.usersRepository.updateProfile(userId, data)
    }

    async updatePassword(userId: UserId, data: any) {
        const { currentPassword, newPassword } = data
        const user = await this.usersRepository.getPasswordById(userId)
        
        if (!user) throw new AppError('Usuario no encontrado', 404)
        
        const isMatch = await checkPassword(currentPassword, user.password)
        if (!isMatch) throw new AppError('Contraseña actual incorrecta', 400)
        
        const hashedPassword = await hashPassword(newPassword)
        await this.usersRepository.updatePassword(userId, hashedPassword)
    }
}
