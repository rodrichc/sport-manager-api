import { Request, Response } from "express"
import { AuthService } from "./auth.service"
import { CreateAccountDTO, LoginDTO } from "./auth.types"
import { catchAsync } from "../../utils/catchAsync"
import { UserSafe } from "../../types"
import QRCode from "qrcode"

export class AuthController {

    constructor(private readonly authService: AuthService) {}

    createAccount = catchAsync(async (req: Request, res: Response) => {
        const userData: CreateAccountDTO = req.body

        const newUser: UserSafe = await this.authService.createAccount(userData)

        res.status(201).json({
            message: 'Usuario creado correctamente',
            data: newUser
        })
    })

    login = catchAsync(async (req: Request, res: Response) => {
        const loginData: LoginDTO = req.body
        const result = await this.authService.login(loginData)
        res.json(result)
    })

    becomeOwner = catchAsync(async (req: Request, res: Response) => {
        await this.authService.becomeOwner(req.user, req.body.phoneNumber)

        res.json({
            message: 'Felicitaciones, ahora podes administrar tus complejos deportivos.'
        })
    })

    sendVerification = catchAsync(async (req: Request, res: Response) => {
        await this.authService.sendVerification(req.body.email)
        res.json({ message: 'Email de verificación enviado' })
    })

    verifyEmail = catchAsync(async (req: Request, res: Response) => {
        await this.authService.verifyEmail(req.body.token)
        res.json({ message: 'Email verificado correctamente' })
    })

    forgotPassword = catchAsync(async (req: Request, res: Response) => {
        await this.authService.forgotPassword(req.body.email)
        res.json({ message: 'Email de recuperación enviado' })
    })

    resetPassword = catchAsync(async (req: Request, res: Response) => {
        await this.authService.resetPassword(req.body.token, req.body.password)
        res.json({ message: 'Contraseña actualizada correctamente' })
    })

    generate2FA = catchAsync(async (req: Request, res: Response) => {
        const url = await this.authService.generate2FA(req.user.id)
        const qrCode = await QRCode.toDataURL(url)
        res.json({ qrCode })
    })

    enable2FA = catchAsync(async (req: Request, res: Response) => {
        await this.authService.enable2FA(req.user.id, req.body.code)
        res.json({ message: '2FA habilitado correctamente' })
    })

    verify2FA = catchAsync(async (req: Request, res: Response) => {
        const token = await this.authService.verify2FA(req.userId, req.body.code)
        res.json({ token })
    })
}