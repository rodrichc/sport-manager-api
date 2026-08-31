import { Resend } from "resend"
import { IEmailService } from "./IEmailService"
import { env } from "../../config/env"

export class ResendEmailService implements IEmailService {
    private resend: Resend
    private fromEmail: string
    private baseUrl: string

    constructor() {
        this.resend = new Resend(env.RESEND_API_KEY)
        this.fromEmail = env.RESEND_FROM_EMAIL 
        this.baseUrl = env.FRONTEND_URL 
    }

    async sendVerificationEmail(email: string, token: string): Promise<void> {
        const confirmLink = `${this.baseUrl}/verify-email?token=${token}`
        
        console.log(`[DEV MODE] 📧 Email de Confirmación enviado a ${email}: ${confirmLink}`)
        
        await this.resend.emails.send({
            from: this.fromEmail,
            to: email,
            subject: 'Confirma tu cuenta',
            html: `<p>Hola, haz clic en el siguiente enlace para confirmar tu cuenta:</p><a href="${confirmLink}">Confirmar Cuenta</a>`
        })
    }

    async sendPasswordResetEmail(email: string, token: string): Promise<void> {
        const resetLink = `${this.baseUrl}/reset-password?token=${token}`
        
        console.log(`[DEV MODE] 📧 Email de Reseteo enviado a ${email}: ${resetLink}`)

        await this.resend.emails.send({
            from: this.fromEmail,
            to: email,
            subject: 'Restablece tu contraseña',
            html: `<p>Hola, haz clic en el siguiente enlace para restablecer tu contraseña:</p><a href="${resetLink}">Restablecer Contraseña</a>`
        })
    }
}
