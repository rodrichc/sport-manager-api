import { Request, Response } from "express"
import { AuthService } from "./auth.service"
import { CreateAccountDTO, LoginDTO } from "./auth.types"
import { catchAsync } from "../../utils/catchAsync"

export class AuthController {

    constructor(private readonly authService: AuthService) {}

    createAccount = catchAsync(async (req: Request, res: Response) => {
        const userData: CreateAccountDTO = req.body

        const newUser = await this.authService.createAccount(userData)

        res.status(201).json({
            message: 'Usuario creado correctamente',
            data: newUser
        })
    })


    login = catchAsync(async (req: Request, res: Response) => {
        const loginData: LoginDTO = req.body

        const token = await this.authService.login(loginData)

        res.send(token)
    })


    getUser = async(req: Request, res: Response) => {
        res.json(req.user)
    }


    becomeOwner = catchAsync(async (req: Request, res: Response) => {
        await this.authService.becomeOwner(req.user, req.body.phoneNumber)

        res.json({
            message: 'Felicitaciones, ahora podes administrar tus complejos deportivos.'
        })
    })
}