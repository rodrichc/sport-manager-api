import { Request, Response } from "express"
import { CourtService } from "./court.service"
import { CreateCourtDTO } from "./court.types"

export class CourtController {

    constructor(private readonly courtService: CourtService) {}

    create = async (req: Request, res: Response) => {
        const userId = req.user?.id
        const courtData: CreateCourtDTO = req.body

        try {
            const newCourt = await this.courtService.createCourt(userId!, courtData)
            
            res.status(201).json({ 
                message: 'Cancha creada con éxito', 
                data: newCourt 
            })

        } catch (error) {
            if (error.message === 'PERMISO_DENEGADO') {
                return res.status(403).json({ error: 'No tenés permiso para crear canchas en este complejo' })
            }
            console.error(error)
            res.status(500).json({ error: 'Error al crear la cancha' })
        }
    }

    getCourts = async (req: Request, res: Response) => {
         try {
            const courts = await this.courtService.getCourts()
            res.json({ data: courts })
        } catch (error) {
            console.error(error)
            res.status(500).json({ error: 'Error al obtener las canchas' })
        }
    }
}
