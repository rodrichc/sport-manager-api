import crypto from "crypto"
import { TOTP, NobleCryptoPlugin, ScureBase32Plugin } from "otplib"

function getTotp(email: string = 'user') {
    return new TOTP({
        issuer: 'SportManager',
        label: email,
        crypto: new NobleCryptoPlugin(),
        base32: new ScureBase32Plugin()
    });
}
import { TokenType } from "@prisma/client"
import { IEmailService } from "../../services/email/IEmailService"
import { ResendEmailService } from "../../services/email/ResendEmailService"
import { AuthRepository } from "./auth.repository"
import { CreateAccountDTO, LoginDTO, UserPhoneNumber } from "./auth.types"
import { checkPassword, hashPassword } from "../../utils/auth"
import { AppError } from "../../utils/appError"
import { generateJWT } from "../../utils/jwt"
import { UserSafe } from "../../types"
import { createUsername } from "../../utils/slugify"

const emailService: IEmailService = new ResendEmailService()

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

        const newUser = await this.authRepository.createUser({
            name,
            email,
            password: hashedPassword,
            username,
            role,
            phoneNumber
        })

        // Send verification email automatically upon registration
        await this.sendVerification(email)

        return {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            username: newUser.username,
            role: newUser.role,
        } 
    }

    async login(data: LoginDTO) {
        const { email, password } = data
        const user = await this.authRepository.findUserForEmail(email)
        if(!user) throw new AppError('El usuario no existe', 404)
        if(!user.confirmed) throw new AppError('Cuenta no confirmada', 403)
        
        const isPasswordCorrect = await checkPassword(password, user.password)
        if(!isPasswordCorrect) throw new AppError('Contraseña incorrecta', 403)

        if(user.isTwoFactorEnabled) {
            return { tempToken: generateJWT({ id: user.id, isTemp: true }), is2faRequired: true }
        }

        return { token: generateJWT({ id: user.id }) }
    }

    async becomeOwner(user: UserSafe, phoneNumber: UserPhoneNumber) {
        if(user.role === 'OWNER') {
            throw new AppError('Ya sos dueño', 400)
        }

        return await this.authRepository.updateToOwner(user.id, phoneNumber)
    }

    async generateToken(): Promise<string> {
        return crypto.randomBytes(32).toString('hex')
    }

    async sendVerification(email: string) {
        const user = await this.authRepository.findUserForEmail(email)
        if(!user) throw new AppError('Usuario no encontrado', 404)
        if(user.confirmed) throw new AppError('La cuenta ya está confirmada', 400)

        await this.authRepository.deleteTokensByUser(user.id, 'EMAIL_VERIFICATION')
        const token = await this.generateToken()
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24) // 24hs
        await this.authRepository.createToken(user.id, token, 'EMAIL_VERIFICATION', expiresAt)
        await emailService.sendVerificationEmail(user.email, token)
    }

    async verifyEmail(token: string) {
        const dbToken = await this.authRepository.findToken(token, 'EMAIL_VERIFICATION')
        if(!dbToken || dbToken.expiresAt < new Date()) throw new AppError('Token inválido o expirado', 400)
        
        await this.authRepository.updateUser(dbToken.userId, { confirmed: true })
        await this.authRepository.deleteToken(dbToken.id)
    }

    async forgotPassword(email: string) {
        const user = await this.authRepository.findUserForEmail(email)
        if(!user) throw new AppError('Usuario no encontrado', 404)

        await this.authRepository.deleteTokensByUser(user.id, 'PASSWORD_RESET')
        const token = await this.generateToken()
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60) // 1h
        await this.authRepository.createToken(user.id, token, 'PASSWORD_RESET', expiresAt)
        await emailService.sendPasswordResetEmail(user.email, token)
    }

    async resetPassword(token: string, password: string) {
        const dbToken = await this.authRepository.findToken(token, 'PASSWORD_RESET')
        if(!dbToken || dbToken.expiresAt < new Date()) throw new AppError('Token inválido o expirado', 400)
        
        const hashedPassword = await hashPassword(password)
        await this.authRepository.updateUser(dbToken.userId, { password: hashedPassword })
        await this.authRepository.deleteToken(dbToken.id)
    }

    async generate2FA(userId: number) {
        const user = await this.authRepository.findById(userId)
        if(!user) throw new AppError('Usuario no encontrado', 404)
        if(user.isTwoFactorEnabled) throw new AppError('2FA ya está habilitado', 400)

        const totp = getTotp(user.email)
        const secret = totp.generateSecret()
        const otpauthUrl = totp.toURI({ secret })
        
        console.log(`[DEV MODE] 🔐 2FA Secret para ${user.email}: ${secret}`)
        
        await this.authRepository.updateUser(user.id, { twoFactorSecret: secret })
        return otpauthUrl
    }

    async enable2FA(userId: number, code: string) {
        const user = await this.authRepository.findById(userId)
        if(!user || !user.twoFactorSecret) throw new AppError('Configuración 2FA incompleta', 400)
        
        const totp = getTotp(user.email)
        const result = await totp.verify(code, { secret: user.twoFactorSecret })
        if(!result.valid) throw new AppError('Código inválido', 400)
        
        await this.authRepository.updateUser(user.id, { isTwoFactorEnabled: true })
    }

    async verify2FA(userId: number, code: string) {
        const user = await this.authRepository.findById(userId)
        if(!user || !user.isTwoFactorEnabled || !user.twoFactorSecret) throw new AppError('2FA no configurado', 400)

        const totp = getTotp(user.email)
        const result = await totp.verify(code, { secret: user.twoFactorSecret })
        if(!result.valid) throw new AppError('Código inválido', 400)

        return generateJWT({ id: user.id })
    }
}