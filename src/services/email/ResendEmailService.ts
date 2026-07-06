import { Resend } from "resend"
import { IEmailService } from "./IEmailService"

export class ResendEmailService implements IEmailService {
    private resend: Resend
    private fromEmail: string
    private baseUrl: string

    constructor() {
        this.resend = new Resend(process.env.RESEND_API_KEY)
        this.fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
        this.baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    }

    async sendVerificationEmail(email: string, token: string): Promise<void> {
        const confirmLink = `${this.baseUrl}/auth/confirm-account?token=${token}`
        
        await this.resend.emails.send({
            from: this.fromEmail,
            to: email,
            subject: 'Confirma tu cuenta',
            html: `<p>Hola, haz clic en el siguiente enlace para confirmar tu cuenta:</p><a href="${confirmLink}">Confirmar Cuenta</a>`
        })
    }

    async sendPasswordResetEmail(email: string, token: string): Promise<void> {
        const resetLink = `${this.baseUrl}/auth/new-password?token=${token}`
        
        await this.resend.emails.send({
            from: this.fromEmail,
            to: email,
            subject: 'Restablece tu contraseña',
            html: `<p>Hola, haz clic en el siguiente enlace para restablecer tu contraseña:</p><a href="${resetLink}">Restablecer Contraseña</a>`
        })
    }
}
