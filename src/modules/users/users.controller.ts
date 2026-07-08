import { Request, Response } from "express"
import { matchedData } from "express-validator"
import { UsersService } from "./users.service"
import { catchAsync } from "../../utils/catchAsync"

export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    getProfile = async (req: Request, res: Response) => {
        res.json(req.user)
    }

    updateProfile = catchAsync(async (req: Request, res: Response) => {
        const validData = matchedData(req, { locations: ['body'] });
        const updatedUser = await this.usersService.updateProfile(req.user.id, validData)
        res.json({ message: 'Perfil actualizado', data: updatedUser })
    })

    updatePassword = catchAsync(async (req: Request, res: Response) => {
        await this.usersService.updatePassword(req.user.id, req.body)
        res.json({ message: 'Contraseña actualizada' })
    })
}
