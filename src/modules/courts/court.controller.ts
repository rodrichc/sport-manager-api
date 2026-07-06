import { Request, Response } from "express"
import { CourtService } from "./court.service"
import { CourtDTO } from "./court.types"
import { catchAsync } from "../../utils/catchAsync"
import { getPagination } from "../../types/pagination"

export class CourtController {

    constructor(private readonly courtService: CourtService) { }

    create = catchAsync(async (req: Request, res: Response) => {
        const userId = req.user.id
        const courtData: CourtDTO = req.body

        const newCourt = await this.courtService.create(userId, courtData)

        res.status(201).json({
            message: 'Cancha creada con éxito',
            data: newCourt
        })
    })

    getById = catchAsync(async (req: Request, res: Response) => {
        const id = Number(req.params.id)

        const court = await this.courtService.findActive(id)

        res.json(court)
    })

    update = catchAsync(async (req: Request, res: Response) => {
        const id = Number(req.params.id)
        const userId = req.user.id
        const courtData = req.body

        const updatedCourt = await this.courtService.update(id, userId, courtData)

        res.json(updatedCourt)
    })

    delete = catchAsync(async (req: Request, res: Response) => {
        const id = Number(req.params.id)
        const userId = req.user.id

        await this.courtService.delete(id, userId)

        res.json({
            message: 'Cancha eliminada correctamente.'
        })
    })

    getAll = catchAsync(async (req: Request, res: Response) => {
        const pagination = getPagination(req)
        const result = pagination
            ? await this.courtService.findAll(pagination)
            : { data: await this.courtService.findAll() }

        res.json(result)
    })

    getUserCourts = catchAsync(async (req: Request, res: Response) => {
        const userId = req.user.id
        const pagination = getPagination(req)

        const result = pagination
            ? await this.courtService.findCourtsUser(userId, pagination)
            : { data: await this.courtService.findCourtsUser(userId) }

        res.json(result)
    })

    getDeletedUserCourts = catchAsync(async (req: Request, res: Response) => {
        const userId = req.user.id
        const pagination = getPagination(req)

        const result = pagination
            ? await this.courtService.findDeletedCourtsUser(userId, pagination)
            : { data: await this.courtService.findDeletedCourtsUser(userId) }

        res.json(result)
    })

    restore = catchAsync(async (req: Request, res: Response) => {
        const id = Number(req.params.id)
        const userId = req.user.id

        const court = await this.courtService.restore(id, userId)

        res.json({
            message: "Cancha restaurada correctamente",
            court
        })
    })

    hardDelete = catchAsync(async (req: Request, res: Response) => {
        const id = Number(req.params.id)
        const userId = req.user.id

        await this.courtService.hardDelete(id, userId)

        res.json({
            message: "Cancha eliminada correctamente"
        })
    })
}
