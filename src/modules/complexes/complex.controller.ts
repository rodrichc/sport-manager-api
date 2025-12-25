import { Request, Response } from "express"
import { catchAsync } from "../../utils/catchAsync"
import { ComplexService } from "./complex.service"
import { CreateComplexDTO, UpdateComplexDTO } from "./complex.types"


export class ComplexController {

    constructor(private readonly complexService: ComplexService) {}
    
    create = catchAsync(async (req: Request, res: Response) => {
        const complexData: CreateComplexDTO = req.body
        const userData = req.user

        const newComplex = await this.complexService.create(complexData, userData)

        res.status(201).json({
            message: "Complejo creado correctamente.",
            newComplex
        })
    }) 

    
    getAll = catchAsync(async (req: Request, res: Response) => {
        const complexes = await this.complexService.getAllActive()

        res.json(complexes)
    })
    
    
    update = catchAsync(async (req: Request, res: Response) => {
        const updateComplexData: UpdateComplexDTO = req.body
        const userData = req.user
        const id = Number(req.params.id) 

        const updatedComplex = await this.complexService.update(updateComplexData, userData, id)

        res.json(updatedComplex)
    }) 


    delete = catchAsync(async (req: Request, res: Response) => {
        const userData = req.user
        const id = Number(req.params.id)

        await this.complexService.delete(userData, id)

        res.json({
            message: 'Complejo eliminado correctamente.'
        })
    })


    getMyActiveComplexes = catchAsync(async (req: Request, res: Response) => {
        const userData = req.user

        const activeComplexes = await this.complexService.findByOwnerActive(userData)

        res.json(activeComplexes)
    })


    getMyDeletedComplexes = catchAsync(async (req: Request, res: Response) => {
        const userData = req.user

        const deletedComplexes = await this.complexService.findByOwnerDeleted(userData)

        res.json(deletedComplexes)
    })


    restore = catchAsync(async (req: Request, res: Response) => {
        const userData = req.user
        const id = Number(req.params.id)

        const complex = await this.complexService.restore(userData, id)

        res.json({
            message: "Complejo restaurado correctamente",
            complex
        })
    })


    hardDelete = catchAsync(async (req: Request, res: Response) => {
        const userData = req.user
        const id = Number(req.params.id)

        await this.complexService.delete(userData, id)

        res.json({
            message: "Complejo restaurado correctamente",
        })
    })


    updateStatus = catchAsync(async (req: Request, res: Response) => {
        const userData = req.user
        const id = Number(req.params.id)
        const status = req.body.status

        const complex = await this.complexService.updateStatus(userData, id, status)

        res.json({
            message: "Estado actualizado correctamente.",
            complex
        })
    })
}