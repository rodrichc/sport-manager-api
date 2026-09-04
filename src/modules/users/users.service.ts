import { UsersRepository } from "./users.repository"
import { AppError } from "../../utils/appError"
import { checkPassword, hashPassword } from "../../utils/auth"
import { UserId } from "../../types"
import { IStorageService } from "../../services/storage/IStorageService"

export class UsersService {
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly storageService: IStorageService
    ) {}

    async updateProfile(userId: UserId, data: any) {
        const currentUser = await this.usersRepository.findAvatarById(userId)
        if(!currentUser) throw new AppError('Usuario no encontrado', 404)
        
        if(
            data.avatar &&
            currentUser.avatar &&
            data.avatar !== currentUser.avatar
        ) {
            await this.storageService.deleteFile(currentUser.avatar)
        }

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
