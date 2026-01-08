import { AuthRepository } from "./auth.repository"
import { CreateAccountDTO, LoginDTO, UserPhoneNumber } from "./auth.types"
import { checkPassword, hashPassword } from "../../utils/auth"
import { AppError } from "../../utils/appError"
import { generateJWT } from "../../utils/jwt"
import { UserSafe } from "../../types"
import { createUsername } from "../../utils/slugify"


export class AuthService {

    constructor(private readonly authRepository: AuthRepository) {}

    async createAccount(data: CreateAccountDTO) {
        const { password, email, name, role, phoneNumber } = data


        const emailExist = await this.authRepository.findUserForEmail(email)

        if(emailExist){
            throw new AppError('El email ya está en uso', 409)
        }


        const username = createUsername(data.username)
        const usernameExist = await this.authRepository.findUserForUsername(username)

        if(usernameExist){
            throw new AppError('El nombre de usuario ya está registrado', 409)
        }


        if(role === 'OWNER' && !phoneNumber) {
            throw new AppError('Los dueños deben registrar un teléfono de contacto', 400)
        }


        const hashedPassword = await hashPassword(password)

        return await this.authRepository.createUser({
            name,
            email,
            password: hashedPassword,
            username,
            role,
            phoneNumber
        })
    }


    async login(data: LoginDTO) {
        const { email, password } = data


        const user = await this.authRepository.findUserForEmail(email)

        if(!user) {
            throw new AppError('El usuario no existe', 404)
        }


        const isPasswordCorrect = await checkPassword(password, user.password)

        if(!isPasswordCorrect) {
            throw new AppError('Contraseña incorrecta', 403)
        }


        const token = generateJWT({
            id: user.id
        })

        return token
    }


    async becomeOwner(user: UserSafe, phoneNumber: UserPhoneNumber) {
        if(user.role === 'OWNER') {
            throw new AppError('Ya sos dueño', 400)
        }

        return await this.authRepository.updateToOwner(user.id, phoneNumber)
    }
}